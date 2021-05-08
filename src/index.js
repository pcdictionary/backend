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

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
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
      },
    };
  })
);

function Player(userInfo) {
  this.userId = userInfo.id;
  this.socketId = userInfo.socketId;
  this.status = userInfo.status;
}

function Teams(socketid, player) {
  this.team1 = { score: 0, readyCount: 0 };
  this.team1.members = { [socketid.toString()]: player };
  this.team2 = { score: 0, readyCount: 0 };
  this.team2.members = {};
  this.approved = { count: 0, total: 0, reject: 0, sockets: {} };
  this.startTime;
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
          });
          delete rooms[activeUsers[id].roomId].team1.members[oldSocket];
        }
        if (rooms[activeUsers[id].roomId].team2.members[oldSocket]) {
          rooms[activeUsers[id].roomId].team2.members[socket.id] = new Player({
            id,
            socketId: socket.id,
            status:
              rooms[activeUsers[id].roomId].team2.members[oldSocket].status,
          });
          delete rooms[activeUsers[id].roomId].team2.members[oldSocket];
        }

        activeUsers[id].socketId = socket.id;
        socket.join(activeUsers[id].roomId);
      }
      console.log(rooms[activeUsers[id].roomId], "ROOMIDDDDDDDDDDDDD");
      serverio.to(socket.id).emit("reconnectedRoom", activeUsers[id].roomId);

      if (rooms[activeUsers[id].roomId].startTime) {
        serverio.to(socket.id).emit("startedMatch");
      }
      serverio.to(socket.id).emit("updateLobby", rooms[activeUsers[id].roomId]);
    }
  });

  socket.on("createRoom", () => {
    if (!activeUsers[id]) {
      let room = uuidv4().toString();
      activeUsers[id] = new User({ socketId: socket.id, room });
      let player = new Player({
        id,
        socketId: socket.id.toString(),
        status: false,
      });
      rooms[room] = new Teams(socket.id, player);
      socket.join(room);
      serverio.to(room).emit("createdRoom", room);
      serverio.to(room).emit("updateLobby", rooms[room]);
    } else {
      serverio.to(socket.id).emit("redirectReconnect");
    }
  });

  socket.on("joinRoom", (room) => {
    if (!activeUsers[id]) {
      if (
        Object.keys(rooms[room].team2.members).length <
        Object.keys(rooms[room].team1.members).length
      ) {
        let player = new Player({
          id,
          socketId: socket.id.toString(),
          status: false,
        });
        rooms[room].team2.members[socket.id.toString()] = player;
        activeUsers[id] = new User({ socketId: socket.id, room });
        socket.join(room);
      } else {
        let player = new Player({ id, socketId: socket.id.toString() });
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

  socket.on("switchTeam", () => {
    if (rooms[activeUsers[id].roomId].team1.members[socket.id]) {
      rooms[activeUsers[id].roomId].team2.members[socket.id] = {
        ...rooms[activeUsers[id].roomId].team1.members[socket.id],
      };
      delete rooms[activeUsers[id].roomId].team1.members[socket.id];
    } else {
      rooms[activeUsers[id].roomId].team1.members[socket.id] = {
        ...rooms[activeUsers[id].roomId].team2.members[socket.id],
      };
      delete rooms[activeUsers[id].roomId].team2.members[socket.id];
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

      rooms[activeUsers[id].roomId].team1.members[socket.id].status = !rooms[
        activeUsers[id].roomId
      ].team1.members[socket.id].status;
    } else {
      if (rooms[activeUsers[id].roomId].team2.members[socket.id].status) {
        rooms[activeUsers[id].roomId].team2.readyCount -= 1;
      } else {
        rooms[activeUsers[id].roomId].team2.readyCount += 1;
      }

      rooms[activeUsers[id].roomId].team2.members[socket.id].status = !rooms[
        activeUsers[id].roomId
      ].team2.members[socket.id].status;
    }
    serverio
      .to(activeUsers[id].roomId)
      .emit("updateLobby", rooms[activeUsers[id].roomId]);
  });

  socket.on("startMatch", () => {
    let team1Count = Object.keys(rooms[activeUsers[id].roomId].team1.members)
      .length;
    let team2Count = Object.keys(rooms[activeUsers[id].roomId].team2.members)
      .length;
    if (
      team1Count === team2Count &&
      team2Count === rooms[activeUsers[id].roomId].team2.readyCount &&
      team1Count === rooms[activeUsers[id].roomId].team1.readyCount
    ) {
      rooms[activeUsers[id].roomId].approved.total = team1Count * 2;
      //add timer
      rooms[activeUsers[id].roomId].startTime = new Date();
      console.log(rooms[activeUsers[id].roomId].startTime, "THIS IS STARTTIME");
      serverio.to(activeUsers[id].roomId).emit("startedMatch");
    }
  });

  socket.on("approveScore", (answer) => {
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
          rooms[activeUsers[id].roomId].approved = {
            count: 0,
            total: 0,
            reject: 0,
            sockets: {},
          };

          //start a new room
          console.log(rooms[activeUsers[id].roomId]);
          serverio
            .to(activeUsers[id].roomId)
            .emit("updateLobby", rooms[activeUsers[id].roomId]);
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

    serverio
      .to(activeUsers[id].roomId)
      .emit("finalizedScore", { team1Score, team2Score });
  });
  socket.on("test", () => {
    var clients = serverio.sockets.adapter.rooms;
    console.log(clients, "THIS IS SOCKETS");
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
