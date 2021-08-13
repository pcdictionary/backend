import { resolvers } from "./resolvers/index.js";
import typeDefs from "./typeDefs/_typeDefs.js";
import express, { request } from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import pkg from "@prisma/client";
import cors from "cors";
import getUserId from "./utils/getUserId.js";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { lowerWinner, status } from "./utils/constants.js";
import { EloRating } from "./utils/elo.js";
import NodeCache from "node-cache";
import dotenv from "dotenv";
import twilio from "twilio";
dotenv.config();

const clientTwilio = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});

export const locationStore = new NodeCache();
export const loginStore = new NodeCache({ checkperiod: 1800 });
export const updateUserStore = new NodeCache({ checkperiod: 3600 });
const app = express();
loginStore.close();
app.use(
  "/graphql",
  graphqlHTTP(async (request, response, graphQLParams) => {
    const userIds = await getUserId(request);
    return {
      schema,
      graphiql: true,
      isAdmin: true,
      context: {
        prisma,
        request,
        verifiedUserId: userIds ? userIds.userId : null,
        clientTwilio,
      },
    };
  })
);

locationStore.on("expired", async (key, value) => {
  const currentPark = await locationStore.get(value);
  delete currentPark[key];
  currentPark.count = currentPark.count - 1;
  if (currentPark.count === 0) {
    await locationStore.del(value);
  } else {
    await locationStore.set(value, currentPark, 0);
  }
});

locationStore.on("error", (error) => {
  console.error(error);
});

function Player(userInfo) {
  this.userId = userInfo.id;
  this.socketId = userInfo.socketId;
  this.status = userInfo.status;
  this.elo = userInfo.elo;
  this.username = userInfo.username;
}

function Teams(socketid, player, gameType) {
  this.team1 = { score: 0, readyCount: 0, averageElo: 0 };
  this.team1.members = { [socketid.toString()]: player };
  this.team2 = { score: 0, readyCount: 0, averageElo: 0 };
  this.team2.members = {};
  this.approved = { count: 0, total: 0, reject: 0, sockets: {} };
  this.startTime = null;
  this.endTime = null;
  this.gameType = gameType;
  this.gameId = -1;
  this.toggle = false;
  this.openMatch = false;
  this.approvalModal = false;
  this.redoModal = false;
  this.results = false;
  this.scoreSet = false;
}

function User(info) {
  this.socketId = info.socketId;
  this.roomId = info.room;
  this.username = info.username;
  this.reconnected = false;
}

const server = http.createServer(app);
const serverio = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    allowedHeaders: ["Allow-Cors"],
    credentials: true,
  },
});
let rooms = {};
var activeUsers = {};
serverio.on("connection", async (socket) => {
  const id = await getUserId(socket.handshake).userId;

  socket.on("reconnect", async () => {
    if (activeUsers[id]) {
      //active player identifie
      let oldSocket = activeUsers[id].socketId;
      if (socket.id !== oldSocket) {
        if (rooms[activeUsers[id].roomId].team1.members[oldSocket]) {
          rooms[activeUsers[id].roomId].team1.members[socket.id] = new Player({
            id,
            socketId: socket.id,
            status:
              rooms[activeUsers[id].roomId].team1.members[oldSocket].status,
            elo: rooms[activeUsers[id].roomId].team1.members[oldSocket].elo,
            username:
              rooms[activeUsers[id].roomId].team1.members[oldSocket].username,
          });
          delete rooms[activeUsers[id].roomId].team1.members[oldSocket];
        }
        if (rooms[activeUsers[id].roomId].team2.members[oldSocket]) {
          rooms[activeUsers[id].roomId].team2.members[socket.id] = new Player({
            id,
            socketId: socket.id,
            status:
              rooms[activeUsers[id].roomId].team2.members[oldSocket].status,
            elo: rooms[activeUsers[id].roomId].team2.members[oldSocket].elo,
            username:
              rooms[activeUsers[id].roomId].team2.members[oldSocket].username,
          });
          delete rooms[activeUsers[id].roomId].team2.members[oldSocket];
        }

        rooms[activeUsers[id].roomId].approved.sockets[socket.id] =
          rooms[activeUsers[id].roomId].approved.sockets[oldSocket];
        delete rooms[activeUsers[id].roomId].approved.sockets[oldSocket];
      }
      activeUsers[id].socketId = socket.id;

      socket.join(activeUsers[id].roomId);

      const gameFound = await prisma.game.findUnique({
        where: {
          id: rooms[activeUsers[id].roomId].gameId,
        },
      });
      if (gameFound) {
        if (gameFound.status !== "COMPLETED") {
          //game in progress
          const startedTime = rooms[activeUsers[id].roomId].startTime.getTime();
          serverio.to(socket.id).emit("startedMatch", startedTime);
          serverio.to(socket.id).emit("updateReconnect", {
            score: {
              team1Score: rooms[activeUsers[id].roomId].team1.score,
              team2Score: rooms[activeUsers[id].roomId].team2.score,
              timer: startedTime,
            },
          });
          if (rooms[activeUsers[id].roomId].scoreSet) {
            if (
              rooms[activeUsers[id].roomId].approved.sockets[socket.id] ===
              undefined
            ) {
              serverio.to(socket.id).emit("finalizedScore", {
                team1Score: rooms[activeUsers[id].roomId].team1.score,
                team2Score: rooms[activeUsers[id].roomId].team2.score,
                timer:
                  rooms[activeUsers[id].roomId].endTime -
                  rooms[activeUsers[id].roomId].startTime,
              });
            }
          }
        }
      }

      serverio
        .to(activeUsers[id].roomId)
        .emit("updateLobby", rooms[activeUsers[id].roomId]);
    } else {
      //player is not in a room so sent back to game home screen
      serverio.to(socket.id).emit("noMatch");
    }
  });

  socket.on("createRoom", async (gameType) => {
    if (!activeUsers[id]) {
      const selectedGameType = gameType.toUpperCase();
      let currentElo = await prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          elo: true,
        },
      });
      let room = uuidv4().toString();
      activeUsers[id] = new User({
        socketId: socket.id,
        room,
        username: currentElo.userName,
      });
      let player = new Player({
        id,
        socketId: socket.id.toString(),
        status: false,
        elo: currentElo.elo[gameType],
        username: currentElo.userName,
      });
      rooms[room] = new Teams(socket.id, player, gameType);
      socket.join(room);
      serverio.to(room).emit("createdRoom", room);
      // serverio.to(room).emit("updateLobby", rooms[room]);
    } else {
      activeUsers[id].reconnected = true;
      serverio.to(socket.id).emit("createdRoom", activeUsers[id].roomId);
      // serverio.to(socket.id).emit("redirectReconnect");
      // serverio.to(socket.id).emit("reconnectedRoom", activeUsers[id].roomId);
      // serverio.to(socket.id).emit("redirectReconnect");
    }
  });

  socket.on("joinRoom", async (room) => {
    if (!activeUsers[id]) {
      if (rooms[room]) {
        if (rooms[room].gameId === -1) {
          let currentElo = await prisma.user.findUnique({
            where: {
              id: id,
            },
            include: {
              elo: true,
            },
          });

          if (
            Object.keys(rooms[room].team2.members).length <
            Object.keys(rooms[room].team1.members).length
          ) {
            let player = new Player({
              id,
              socketId: socket.id.toString(),
              status: false,
              elo: currentElo.elo[rooms[room].gameType],
              username: currentElo.userName,
            });
            rooms[room].team2.members[socket.id.toString()] = player;
            activeUsers[id] = new User({
              socketId: socket.id,
              room,
              username: currentElo.userName,
            });
            socket.join(room);
          } else {
            let player = new Player({
              id,
              socketId: socket.id.toString(),
              status: false,
              elo: currentElo.elo[rooms[room].gameType],
              username: currentElo.userName,
            });
            rooms[room].team1.members[socket.id.toString()] = player;
            activeUsers[id] = new User({
              socketId: socket.id,
              room,
              username: currentElo.userName,
            });
            socket.join(room);
          }
          serverio.to(socket.id).emit("joinSuccess", room);
          // serverio.to(room).emit("updateLobby", rooms[activeUsers[id].roomId]);
        }
      } else {
        serverio.to(socket.id).emit("joinError");
      }
    } else {
      // serverio.to(socket.id).emit("redirectReconnect");
      // serverio.to(socket.id).emit("reconnectedRoom", activeUsers[id].roomId);
      // serverio.to(room).emit("updateLobby", rooms[activeUsers[id].roomId]);
    }
  });

  socket.on("joinOptions", async () => {
    if (!activeUsers[id]) {
      serverio.to(socket.id).emit("redirectQRCode");
    } else {
      activeUsers[id].reconnected = true;
      serverio
        .to(socket.id)
        .emit("reconnectedRoom", { roomId: activeUsers[id].roomId });
    }
  });

  socket.on("leaveRoom", async () => {
    if (activeUsers[id]) {
      const gameFound = await prisma.game.findUnique({
        where: {
          id: rooms[activeUsers[id].roomId].gameId,
        },
      });
      if (!gameFound) {
        socket.leave(activeUsers[id].roomId);

        if (rooms[activeUsers[id].roomId].team1.members[socket.id]) {
          if (
            rooms[activeUsers[id].roomId].team1.members[socket.id].status ===
            true
          ) {
            rooms[activeUsers[id].roomId].team1.readyCount =
              rooms[activeUsers[id].roomId].team1.readyCount - 1;
          }
          delete rooms[activeUsers[id].roomId].team1.members[socket.id];
        }

        if (rooms[activeUsers[id].roomId].team2.members[socket.id]) {
          if (
            rooms[activeUsers[id].roomId].team2.members[socket.id].status ===
            true
          ) {
            rooms[activeUsers[id].roomId].team2.readyCount =
              rooms[activeUsers[id].roomId].team2.readyCount - 1;
          }
          delete rooms[activeUsers[id].roomId].team2.members[socket.id];
        }

        serverio
          .to(activeUsers[id].roomId)
          .emit("updateLobby", rooms[activeUsers[id].roomId]);

        if (
          Object.keys(rooms[activeUsers[id].roomId].team1.members).length ===
            0 &&
          Object.keys(rooms[activeUsers[id].roomId].team2.members).length === 0
        ) {
          delete rooms[activeUsers[id].roomId];
        }
        delete activeUsers[id];
      }
    }
  });

  socket.on("switchTeam", async () => {
    if (activeUsers[id]) {
      let currentElo = await prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          elo: true,
        },
      });
      const gameFound = await prisma.game.findUnique({
        where: {
          id: rooms[activeUsers[id].roomId].gameId,
        },
      });
      if (!gameFound) {
        if (rooms[activeUsers[id].roomId].team1.members[socket.id]) {
          if (!rooms[activeUsers[id].roomId].team1.members[socket.id].status) {
            rooms[activeUsers[id].roomId].team2.members[socket.id] = new Player(
              {
                id: id,
                socketId:
                  rooms[activeUsers[id].roomId].team1.members[socket.id]
                    .socketId,
                status:
                  rooms[activeUsers[id].roomId].team1.members[socket.id].status,
                elo: currentElo.elo[rooms[activeUsers[id].roomId].gameType],
                username: currentElo.userName,
              }
            );
            delete rooms[activeUsers[id].roomId].team1.members[socket.id];
          }
        } else {
          if (!rooms[activeUsers[id].roomId].team2.members[socket.id].status) {
            rooms[activeUsers[id].roomId].team1.members[socket.id] = new Player(
              {
                id: id,
                socketId:
                  rooms[activeUsers[id].roomId].team2.members[socket.id]
                    .socketId,
                status:
                  rooms[activeUsers[id].roomId].team2.members[socket.id].status,
                elo: currentElo.elo[rooms[activeUsers[id].roomId].gameType],
                username: currentElo.userName,
              }
            );
            delete rooms[activeUsers[id].roomId].team2.members[socket.id];
          }
        }
        serverio
          .to(activeUsers[id].roomId)
          .emit("updateLobby", rooms[activeUsers[id].roomId]);
      }
    }
  });

  socket.on("switchStatus", async () => {
    if (activeUsers[id]) {
      const gameFound = await prisma.game.findUnique({
        where: {
          id: rooms[activeUsers[id].roomId].gameId,
        },
      });
      if (!gameFound) {
        if (rooms[activeUsers[id].roomId].team1.members[socket.id]) {
          if (rooms[activeUsers[id].roomId].team1.members[socket.id].status) {
            rooms[activeUsers[id].roomId].team1.readyCount -= 1;
          } else {
            rooms[activeUsers[id].roomId].team1.readyCount += 1;
          }

          rooms[activeUsers[id].roomId].team1.members[socket.id].status =
            !rooms[activeUsers[id].roomId].team1.members[socket.id].status;
        } else {
          if (rooms[activeUsers[id].roomId].team2.members[socket.id].status) {
            rooms[activeUsers[id].roomId].team2.readyCount -= 1;
          } else {
            rooms[activeUsers[id].roomId].team2.readyCount += 1;
          }

          rooms[activeUsers[id].roomId].team2.members[socket.id].status =
            !rooms[activeUsers[id].roomId].team2.members[socket.id].status;
        }
        serverio
          .to(activeUsers[id].roomId)
          .emit("updateLobby", rooms[activeUsers[id].roomId]);
      }
    }
  });

  socket.on("startMatch", async () => {
    if (activeUsers[id]) {
      const gameFound = await prisma.game.findUnique({
        where: {
          id: rooms[activeUsers[id].roomId].gameId,
        },
      });
      if (!gameFound) {
        let team1Count = Object.values(
          rooms[activeUsers[id].roomId].team1.members
        );
        let team2Count = Object.values(
          rooms[activeUsers[id].roomId].team2.members
        );
        if (
          team1Count.length === team2Count.length &&
          team2Count.length ===
            rooms[activeUsers[id].roomId].team2.readyCount &&
          team1Count.length === rooms[activeUsers[id].roomId].team1.readyCount
        ) {
          rooms[activeUsers[id].roomId].approved.total =
            team1Count.length + team2Count.length;
          //add timer

          let team1Users = [];
          let team2Users = [];
          let allTeamIds = [];
          let team1EloSum = 0;
          let team2EloSum = 0;
          for (let x = 0; x < team1Count.length; x++) {
            team1Users.push({ id: team1Count[x].userId });
            team2Users.push({ id: team2Count[x].userId });
            allTeamIds.push(team2Count[x].userId);
            allTeamIds.push(team1Count[x].userId);
            team1EloSum += team1Count[x].elo;
            team2EloSum += team2Count[x].elo;
          }
          rooms[activeUsers[id].roomId].team1.averageElo =
            team1EloSum / team1Count.length;
          rooms[activeUsers[id].roomId].team2.averageElo =
            team2EloSum / team2Count.length;

          const currentTime = new Date();

          rooms[activeUsers[id].roomId].startTime = currentTime;
          const selectedGameType =
            rooms[activeUsers[id].roomId].gameType.toUpperCase();
          const gameId = await prisma.game.create({
            data: {
              users: {
                connect: team1Users,
              },
              users2: {
                connect: team2Users,
              },
              status: status.STARTED,
              GameType: selectedGameType,
              createdAt: rooms[activeUsers[id].roomId].startTime,
            },
          });
          for (let x = 0; x < allTeamIds.length; x++) {
            await prisma.user.update({
              where: {
                id: allTeamIds[x],
              },
              data: {
                allGames: {
                  connect: {
                    id: gameId.id,
                  },
                },
              },
            });
          }
          rooms[activeUsers[id].roomId].toggle = true;
          rooms[activeUsers[id].roomId].gameId = gameId.id;
          serverio
            .to(activeUsers[id].roomId)
            .emit("startedMatch", currentTime.getTime());
        }
      }
    }
  });

  socket.on("approveScore", async ({ answer }) => {
    if (activeUsers[id]) {
      const gameFound = await prisma.game.findUnique({
        where: {
          id: rooms[activeUsers[id].roomId].gameId,
        },
      });
      if (gameFound) {
        if (gameFound.status !== "COMPLETED") {
          if (
            rooms[activeUsers[id].roomId].approved.sockets[socket.id] ===
            undefined
          ) {
            if (answer) {
              rooms[activeUsers[id].roomId].approved.sockets[socket.id] = true;
              rooms[activeUsers[id].roomId].approved.count++;
              if (
                rooms[activeUsers[id].roomId].approved.count /
                  rooms[activeUsers[id].roomId].approved.total >
                0.65
              ) {
                rooms[activeUsers[id].roomId].endTime = new Date();
                await prisma.game.update({
                  where: {
                    id: rooms[activeUsers[id].roomId].gameId,
                  },
                  data: {
                    score1: parseInt(rooms[activeUsers[id].roomId].team1.score),
                    score2: parseInt(rooms[activeUsers[id].roomId].team2.score),
                    endedAt: rooms[activeUsers[id].roomId].endTime,
                    status: status.COMPLETED,
                  },
                });

                //update db
                let currentMembersTeam1 = {};
                let currentMembersTeam2 = {};
                var clients = serverio.sockets.adapter.rooms;
                let activeClients = clients.get(activeUsers[id].roomId);
                let activeClientsValues = activeClients.values();
                for (let x = 0; x < activeClients.size; x++) {
                  let cur = activeClientsValues.next().value;
                  if (rooms[activeUsers[id].roomId].team1.members[cur]) {
                    currentMembersTeam1[cur] = {
                      ...rooms[activeUsers[id].roomId].team1.members[cur],
                      status: false,
                    };
                  }
                  if (rooms[activeUsers[id].roomId].team2.members[cur]) {
                    currentMembersTeam2[cur] = {
                      ...rooms[activeUsers[id].roomId].team2.members[cur],
                      status: false,
                    };
                  }
                }
                rooms[activeUsers[id].roomId].team1.members =
                  currentMembersTeam1;
                rooms[activeUsers[id].roomId].team2.members =
                  currentMembersTeam2;
                rooms[activeUsers[id].roomId].team1.readyCount = 0;
                rooms[activeUsers[id].roomId].team2.readyCount = 0;
                rooms[activeUsers[id].roomId].approved = {
                  count: 0,
                  total: 0,
                  reject: 0,
                  sockets: {},
                };
                rooms[activeUsers[id].roomId].gameId = -1;
                rooms[activeUsers[id].roomId].startTime = null;
                rooms[activeUsers[id].roomId].endTime = null;
                //start a new room

                serverio.to(activeUsers[id].roomId).emit("completedMatch");
              }
            } else {
              rooms[activeUsers[id].roomId].approved.sockets[socket.id] = false;
              rooms[activeUsers[id].roomId].approved.reject++;
              if (
                rooms[activeUsers[id].roomId].approved.reject >=
                rooms[activeUsers[id].roomId].approved.total * 0.35
              ) {
                serverio.to(activeUsers[id].roomId).emit("redoScore");
                //redo vote
                rooms[activeUsers[id].roomId].approved.sockets = {};
                rooms[activeUsers[id].roomId].approved.count = 0;
                rooms[activeUsers[id].roomId].approved.reject = 0;
              }
            }
            rooms[activeUsers[id].roomId].scoreSet = false;
            serverio.to(activeUsers[id].roomId).emit("approvedScore", {
              count: rooms[activeUsers[id].roomId].approved.count,
              total: rooms[activeUsers[id].roomId].approved.total,
            });
          }
        }
      }
    }
  });

  socket.on("finalScore", async ({ team1Score, team2Score }) => {
    if (activeUsers[id]) {
      const gameFound = await prisma.game.findUnique({
        where: {
          id: rooms[activeUsers[id].roomId].gameId,
        },
      });
      if (gameFound) {
        if (!rooms[activeUsers[id].roomId].scoreSet) {
          if (gameFound.status !== "COMPLETED") {
            rooms[activeUsers[id].roomId].team1.score = team1Score;
            rooms[activeUsers[id].roomId].team2.score = team2Score;
            rooms[activeUsers[id].roomId].approved.sockets[socket.id] = true;
            rooms[activeUsers[id].roomId].approved.count++;
            rooms[activeUsers[id].roomId].scoreSet = true;
            const timer =
              rooms[activeUsers[id].roomId].endTime -
              rooms[activeUsers[id].roomId].startTime;
            socket
              .to(activeUsers[id].roomId)
              .emit("finalizedScore", { team1Score, team2Score, timer });
            serverio
              .to(activeUsers[id].socketId)
              .emit("finalizedScoreUser", { team1Score, team2Score, timer });
          }
        } else {
        }
      }
    }
  });

  socket.on("test", () => {});

  socket.on("updateElo", async () => {
    let newElo;
    let oldElo;
    let teamAvgElo;
    let d;
    if (!lowerWinner[rooms[activeUsers[id].roomId].gameType]) {
      if (rooms[activeUsers[id].roomId].team1.members[socket.id]) {
        oldElo = rooms[activeUsers[id].roomId].team1.members[socket.id].elo;
        teamAvgElo = rooms[activeUsers[id].roomId].team2.averageElo;
        if (
          rooms[activeUsers[id].roomId].team1.score >
          rooms[activeUsers[id].roomId].team2.score
        ) {
          d = 1;
        } else if (
          rooms[activeUsers[id].roomId].team1.score <
          rooms[activeUsers[id].roomId].team2.score
        ) {
          d = -1;
        } else if (
          rooms[activeUsers[id].roomId].team1.score ===
          rooms[activeUsers[id].roomId].team2.score
        ) {
          d = 0;
        }
      }
      if (rooms[activeUsers[id].roomId].team2.members[socket.id]) {
        oldElo = rooms[activeUsers[id].roomId].team2.members[socket.id].elo;
        teamAvgElo = rooms[activeUsers[id].roomId].team1.averageElo;
        if (
          rooms[activeUsers[id].roomId].team2.score >
          rooms[activeUsers[id].roomId].team1.score
        ) {
          d = 1;
        } else if (
          rooms[activeUsers[id].roomId].team2.score <
          rooms[activeUsers[id].roomId].team1.score
        ) {
          d = -1;
        } else if (
          rooms[activeUsers[id].roomId].team2.score ===
          rooms[activeUsers[id].roomId].team1.score
        ) {
          d = 0;
        }
      }
    }

    newElo = EloRating(oldElo, teamAvgElo, 30000, d);
    await prisma.elo.update({
      where: {
        username: activeUsers[id].username,
      },
      data: {
        [rooms[activeUsers[id].roomId].gameType]: newElo.Ra,
        eloHistory: {
          create: {
            eloHistory: oldElo,
            GameType: rooms[activeUsers[id].roomId].gameType.toUpperCase(),
          },
        },
      },
    });
    if (rooms[activeUsers[id].roomId].team1.members[socket.id]) {
      rooms[activeUsers[id].roomId].team1.members[socket.id].elo = newElo.Ra;
    } else {
      rooms[activeUsers[id].roomId].team2.members[socket.id].elo = newElo.Ra;
    }
    serverio.to(socket.id).emit("updatedElo", { oldElo, newElo: newElo.Ra });
    serverio
      .to(activeUsers[id].roomId)
      .emit("updateLobby", rooms[activeUsers[id].roomId]);
  });

  socket.on("activeGameCheck", async () => {
    if (activeUsers[id]) {
      const gameFound = await prisma.game.findUnique({
        where: {
          id: rooms[activeUsers[id].roomId].gameId,
        },
      });
      if (gameFound) {
        if (gameFound.status !== "COMPLETED") {
          serverio.to(activeUsers[id].socketId).emit("activeGameChecked", true);
        }
      } else {
        serverio.to(activeUsers[id].socketId).emit("activeGameChecked", false);
      }
    }
  });

  socket.on("disconnect", async () => {
    if (activeUsers[id]) {
      if (activeUsers[id].reconnected) {
        activeUsers[id].reconnected = false;
      } else {
        const gameFound = await prisma.game.findUnique({
          where: {
            id: rooms[activeUsers[id].roomId].gameId,
          },
        });

        if (rooms[activeUsers[id].roomId].startTime === null) {
          if (rooms[activeUsers[id].roomId].team1.members[socket.id]) {
            if (
              rooms[activeUsers[id].roomId].team1.members[socket.id].status ===
              true
            ) {
              rooms[activeUsers[id].roomId].team1.readyCount =
                rooms[activeUsers[id].roomId].team1.readyCount - 1;
            }
            delete rooms[activeUsers[id].roomId].team1.members[socket.id];
          }

          if (rooms[activeUsers[id].roomId].team2.members[socket.id]) {
            if (
              rooms[activeUsers[id].roomId].team2.members[socket.id].status ===
              true
            ) {
              rooms[activeUsers[id].roomId].team2.readyCount =
                rooms[activeUsers[id].roomId].team2.readyCount - 1;
            }

            delete rooms[activeUsers[id].roomId].team2.members[socket.id];
          }
          serverio
            .to(activeUsers[id].roomId)
            .emit("updateLobby", rooms[activeUsers[id].roomId]);

          if (
            Object.keys(rooms[activeUsers[id].roomId].team1.members).length ===
              0 &&
            Object.keys(rooms[activeUsers[id].roomId].team2.members).length ===
              0
          ) {
            delete rooms[activeUsers[id].roomId];
          }
          delete activeUsers[id];
        }
      }
    }
  });
});
const port = process.env.PORT || 4000;
const hostname = "192.168.0.113";

if (process.env.PORT) {
  server.listen(port, () => {
    console.log(`SERVER IS RUNNING,${port}`);
  });
} else {
  server.listen(port, hostname, () => {
    console.log(`SERVER IS RUNNING,${port}`);
  });
}
