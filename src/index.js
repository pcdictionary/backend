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
import { EloRating, probability } from "./utils/elo.js";
import redis from 'redis';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});
const locationStore = redis.createClient(6379);

locationStore.on("error", (error) => {
  console.error(error);
});

const app = express();

app.use(
  cors({
    origin: "http://localhost:19002",
    credentials: true,
  })
);

app.use(
  "/graphql",
  graphqlHTTP(async (request, response, graphQLParams) => {
    // console.log(request,"THIS IS REQUEST")
    const userIds = await getUserId(request);
    // console.log(userIds, "THIS IS USERID");
    return {
      schema,
      graphiql: true,
      isAdmin: true,
      context: {
        prisma,
        request,
        verifiedUserId: userIds ? userIds.userId : null,
        locationStore
      },
    };
  })
);

function Player(userInfo) {
  this.userId = userInfo.id;
  this.socketId = userInfo.socketId;
  this.status = userInfo.status;
  this.elo = userInfo.elo;
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
  this.gameId = null;
}

function User(info) {
  this.socketId = info.socketId;
  this.roomId = info.room;
}

const server = http.createServer(app);
const serverio = new Server(server, {
  cors: {
    origin: "http://localhost:19002",
    methods: ["GET", "POST"],
    allowedHeaders: ["Allow-Cors"],
    credentials: true,
  },
});
let rooms = {};
var activeUsers = {};
serverio.on("connection", async (socket) => {
  const id = await getUserId(socket.handshake).userId;
  console.log(id, "THIS IS ID");
  socket.on("reconnect", () => {
    if (activeUsers[id]) {
      let oldSocket = activeUsers[id].socketId;

      console.log(socket.id, oldSocket, "SOCKETID and OLD SOCKET");

      if (socket.id !== oldSocket) {
        console.log(socket.id, "NEW ID");
        console.log(oldSocket, "OLDID");
        if (rooms[activeUsers[id].roomId].team1.members[oldSocket]) {
          rooms[activeUsers[id].roomId].team1.members[socket.id] = new Player({
            id,
            socketId: socket.id,
            status:
              rooms[activeUsers[id].roomId].team1.members[oldSocket].status,
            elo: rooms[activeUsers[id].roomId].team1.members[oldSocket].elo,
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
          });
          delete rooms[activeUsers[id].roomId].team2.members[oldSocket];
        }

        activeUsers[id].socketId = socket.id;
        socket.join(activeUsers[id].roomId);
      }
      serverio.to(socket.id).emit("reconnectedRoom", activeUsers[id].roomId);

      if (rooms[activeUsers[id].roomId].startTime) {
        serverio.to(socket.id).emit("startedMatch");
      }
      serverio.to(socket.id).emit("updateLobby", rooms[activeUsers[id].roomId]);
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
      console.log(currentElo.elo[gameType]);
      let room = uuidv4().toString();
      activeUsers[id] = new User({ socketId: socket.id, room });
      let player = new Player({
        id,
        socketId: socket.id.toString(),
        status: false,
        elo: currentElo.elo[gameType],
      });
      rooms[room] = new Teams(socket.id, player, gameType);
      socket.join(room);
      serverio.to(room).emit("createdRoom", room);
      serverio.to(room).emit("updateLobby", rooms[room]);
    } else {
      serverio.to(socket.id).emit("redirectReconnect");
    }
  });

  socket.on("joinRoom", async (room) => {
    if (!activeUsers[id]) {
      let currentElo = await prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          elo: true,
        },
      });

      console.log(rooms[room], "LOOK FOR GAME TYPE");
      if (
        Object.keys(rooms[room].team2.members).length <
        Object.keys(rooms[room].team1.members).length
      ) {
        let player = new Player({
          id,
          socketId: socket.id.toString(),
          status: false,
          elo: currentElo.elo[rooms[room].gameType],
        });
        rooms[room].team2.members[socket.id.toString()] = player;
        activeUsers[id] = new User({ socketId: socket.id, room });
        socket.join(room);
      } else {
        let player = new Player({
          id,
          socketId: socket.id.toString(),
          status: false,
          elo: currentElo.elo[rooms[room].gameType],
        });
        rooms[room].team1.members[socket.id.toString()] = player;
        activeUsers[id] = new User({ socketId: socket.id, room });
        socket.join(room);
      }
      console.log(rooms);
      serverio.to(room).emit("updateLobby", rooms[activeUsers[id].roomId]);
    } else {
      serverio.to(socket.id).emit("redirectReconnect");
    }
  });

  socket.on("joinOptions", () => {
    if (!activeUsers[id]) {
      serverio.to(socket.id).emit("redirectQRCode");
    } else {
      serverio.to(socket.id).emit("redirectReconnect");
    }
  });

  socket.on("leaveRoom", () => {
    console.log(activeUsers);
    socket.leave(activeUsers[id].roomId);

    delete rooms[activeUsers[id].roomId].team1.members[socket.id];
    delete rooms[activeUsers[id].roomId].team2.members[socket.id];
    serverio
      .to(activeUsers[id].roomId)
      .emit("updateLobby", rooms[activeUsers[id].roomId]);
    delete activeUsers[id];
  });

  socket.on("switchTeam", async () => {
    let currentElo = await prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        elo: true,
      },
    });
    if (rooms[activeUsers[id].roomId].team1.members[socket.id]) {
      if (!rooms[activeUsers[id].roomId].team1.members[socket.id].status) {
        rooms[activeUsers[id].roomId].team2.members[socket.id] = new Player({
          id: id,
          socketId:
            rooms[activeUsers[id].roomId].team1.members[socket.id].socketId,
          status: rooms[activeUsers[id].roomId].team1.members[socket.id].status,
          elo: currentElo.elo[rooms[activeUsers[id].roomId].gameType],
        });
        delete rooms[activeUsers[id].roomId].team1.members[socket.id];
      }
    } else {
      if (!rooms[activeUsers[id].roomId].team2.members[socket.id].status) {
        rooms[activeUsers[id].roomId].team1.members[socket.id] = new Player({
          id: id,
          socketId:
            rooms[activeUsers[id].roomId].team2.members[socket.id].socketId,
          status: rooms[activeUsers[id].roomId].team2.members[socket.id].status,
          elo: currentElo.elo[rooms[activeUsers[id].roomId].gameType],
        });
        delete rooms[activeUsers[id].roomId].team2.members[socket.id];
      }
    }
    serverio
      .to(activeUsers[id].roomId)
      .emit("updateLobby", rooms[activeUsers[id].roomId]);
  });

  socket.on("switchStatus", () => {
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
  });

  socket.on("startMatch", async () => {
    console.log(rooms[activeUsers[id].roomId].team1.members, "TEAM 1");
    console.log(rooms[activeUsers[id].roomId].team2.members, "THEAM 2");
    let team1Count = Object.values(rooms[activeUsers[id].roomId].team1.members);
    let team2Count = Object.values(rooms[activeUsers[id].roomId].team2.members);
    if (
      team1Count.length === team2Count.length &&
      team2Count.length === rooms[activeUsers[id].roomId].team2.readyCount &&
      team1Count.length === rooms[activeUsers[id].roomId].team1.readyCount
    ) {
      rooms[activeUsers[id].roomId].approved.total =
        team1Count.length + team2Count.length;
      //add timer

      let team1Users = [];
      let team2Users = [];
      let team1EloSum = 0;
      let team2EloSum = 0;
      console.log(team1Count[0].userId, "TEHAM1XCOUNT");
      for (let x = 0; x < team1Count.length; x++) {
        team1Users.push({ id: team1Count[x].userId });
        team2Users.push({ id: team2Count[x].userId });

        team1EloSum += team1Count[x].elo;
        team2EloSum += team2Count[x].elo;
      }
      rooms[activeUsers[id].roomId].team1.averageElo =
        team1EloSum / team1Count.length;
      rooms[activeUsers[id].roomId].team2.averageElo =
        team2EloSum / team2Count.length;

      rooms[activeUsers[id].roomId].startTime = new Date();
      console.log(team1Users, "TEAM1USERS");
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
      rooms[activeUsers[id].roomId].gameId = gameId.id;
      console.log(rooms[activeUsers[id].roomId].startTime, "THIS IS STARTTIME");
      serverio.to(activeUsers[id].roomId).emit("startedMatch");
    }
  });

  socket.on("approveScore", async ({ answer }) => {
    console.log("HIT", socket.id);

    if (
      rooms[activeUsers[id].roomId].approved.sockets[socket.id] === undefined
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
          console.log(clients.get(activeUsers[id].roomId));
          let activeClients = clients.get(activeUsers[id].roomId);
          let activeClientsValues = activeClients.values();
          for (let x = 0; x < activeClients.size; x++) {
            let cur = activeClientsValues.next().value;
            console.log(cur, "this is cur");
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
          rooms[activeUsers[id].roomId].team1.members = currentMembersTeam1;
          rooms[activeUsers[id].roomId].team2.members = currentMembersTeam2;
          rooms[activeUsers[id].roomId].team1.readyCount = 0;
          rooms[activeUsers[id].roomId].team2.readyCount = 0;
          rooms[activeUsers[id].roomId].approved = {
            count: 0,
            total: 0,
            reject: 0,
            sockets: {},
          };
          rooms[activeUsers[id].roomId].gameId = null;
          rooms[activeUsers[id].roomId].startTime = null;
          rooms[activeUsers[id].roomId].endTime = null;

          //start a new room
          console.log(rooms[activeUsers[id].roomId]);

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
      serverio.to(activeUsers[id].roomId).emit("approvedScore", {
        count: rooms[activeUsers[id].roomId].approved.count,
        total: rooms[activeUsers[id].roomId].approved.total,
      });
    }
  });

  socket.on("finalScore", ({ team1Score, team2Score }) => {
    rooms[activeUsers[id].roomId].team1.score = team1Score;
    rooms[activeUsers[id].roomId].team2.score = team2Score;
    rooms[activeUsers[id].roomId].approved.sockets[socket.id] = true;
    rooms[activeUsers[id].roomId].approved.count++;
    const timer =
      rooms[activeUsers[id].roomId].endTime -
      rooms[activeUsers[id].roomId].startTime;

    serverio
      .to(activeUsers[id].roomId)
      .emit("finalizedScore", { team1Score, team2Score, timer });
  });
  socket.on("test", () => {
    var clients = serverio.sockets.adapter.rooms;
    console.log(clients, "THIS IS SOCKETS");
  });

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

    newElo = EloRating(oldElo, teamAvgElo, 30, d);
    console.log(newElo, "THIS IS NEW ELO", oldElo, teamAvgElo);
    await prisma.elo.update({
      where: {
        userId: id,
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

  socket.on("disconnect", () => {
    if (activeUsers[id]) {
      if (!rooms[activeUsers[id].roomId].startTime) {
        console.log("DISCONNECT HIT");
        console.log(rooms[activeUsers[id].roomId].startTime);
        delete rooms[activeUsers[id].roomId].team1.members[socket.id];
        delete rooms[activeUsers[id].roomId].team2.members[socket.id];
        serverio
          .to(activeUsers[id].roomId)
          .emit("updateLobby", rooms[activeUsers[id].roomId]);
        delete activeUsers[id];
      }
      console.log("bye");
    }
  });
  // console.log("a user connected", socket.id);
});
const hostname = "192.168.0.112";
server.listen(4000, hostname, () => [console.log("Server is running")]);
