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
  this.status = false;
}

function Teams(socketid, player) {
  this.team1 = { score: 0, readyCount: 0 };
  this.team1.members = { [socketid.toString()]: player };
  this.team2 = { score: 0, readyCount: 0 };
  this.team2.members = {};
  this.approved = { count: 0, total: 0, reject: 0, sockets: {}};
  this.timer = 0;
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
      let roomId = activeUsers[id].socketId;
      let oldSocketId = Object.keys(rooms[activeUsers[id].roomId].team1)[0];
      console.log(oldSocketId);
      delete activeUsers[id];
      activeUsers[id] = { [socket.id]: roomId };

      // rooms[activeUsers[id][socket.id]].team1;
    }
  });

  socket.on("createRoom", () => {
    // if (!activeUsers[id]) {
    let room = uuidv4().toString();
    activeUsers[id] = new User({ socketId: socket.id, room });
    let player = new Player({ id, socketId: socket.id.toString() });
    rooms[room] = new Teams(socket.id, player);
    socket.join(room);
    serverio.to(room).emit("createdRoom", room);
    serverio.to(room).emit("updateLobby", rooms[room]);
    // }
  });

  socket.on("joinRoom", (room) => {
    if (
      Object.keys(rooms[room].team2.members).length <
      Object.keys(rooms[room].team1.members).length
    ) {
      let player = new Player({ id, socketId: socket.id.toString() });
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
      serverio.to(activeUsers[id].roomId).emit("startedMatch");
    }
  });

  socket.on("approveScore", (answer) => {
    console.log("HIT",socket.id)
    console.log(rooms[activeUsers[id].roomId].approved.sockets)
    if (rooms[activeUsers[id].roomId].approved.sockets[socket.id] === undefined) {
      if (answer) {
        rooms[activeUsers[id].roomId].approved.sockets[socket.id] = true;
        rooms[activeUsers[id].roomId].approved.count++;
        if (
          rooms[activeUsers[id].roomId].approved.count /
            rooms[activeUsers[id].roomId].approved.total >
          0.65
        ) {
          //update db
          //start a new room
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
          rooms[activeUsers[id].roomId].approved.sockets = {}
          rooms[activeUsers[id].roomId].approved.count = 0
          rooms[activeUsers[id].roomId].approved.reject = 0
          console.log(rooms[activeUsers[id].roomId].approved)
        }
      }
      serverio.to(activeUsers[id].roomId).emit("approvedScore", {
        count: rooms[activeUsers[id].roomId].approved.count,
        total:
          Object.keys(rooms[activeUsers[id].roomId].team1.members).length * 2,
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
    console.log("bye");
  });
  // console.log("a user connected", socket.id);
});
const hostname = "192.168.0.112";
server.listen(4000, hostname, () => [console.log("Server is running")]);
