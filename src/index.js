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
  this.approved = { team1: false, team2: false };
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
    if (
      Object.keys(rooms[activeUsers[id].roomId].team2.members).length ===
        Object.keys(rooms[activeUsers[id].roomId].team1.members).length &&
      Object.keys(rooms[activeUsers[id].roomId].team2.members).length ===
        rooms[activeUsers[id].roomId].team2.readyCount &&
      Object.keys(rooms[activeUsers[id].roomId].team1.members).length ===
        rooms[activeUsers[id].roomId].team1.readyCount
    ) {
      //add timer
      serverio.to(activeUsers[id].roomId).emit("startedMatch");
    }
  });

  socket.on("approveScore", () => {
    rooms[activeUsers[id][socket.id]].approved[socket.id] = true;
    if (
      Object.keys(rooms[activeUsers[id].roomId].approved).length >=
      (Object.keys(rooms[activeUsers[id].roomId].team1.members).length +
        Object.keys(rooms[activeUsers[id].roomId].team2.members).length) *
        0.75
    ) {
      //update db
      serverio.to(activeUsers[id].roomId).emit("approvedScore", {
        team1Score: rooms[activeUsers[id].roomId].team1.score,
        team2Score: rooms[activeUsers[id].roomId].team2.score,
      });
    }
  });

  socket.on("finalScore", ({ team1Score, team2Score }) => {
    rooms[activeUsers[id].roomId].team1.score = team1Score;
    rooms[activeUsers[id].roomId].team2.score = team2Score;
    rooms[activeUsers[id].roomId].approved[socket.id] = true;
    serverio
      .to(activeUsers[id].roomId)
      .emit("finalizedScore", { team1Score, team2Score });
  });

  // console.log("a user connected", socket.id);
});
const hostname = "192.168.0.112";
server.listen(4000, hostname, () => [console.log("Server is running")]);
