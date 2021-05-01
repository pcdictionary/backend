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
    console.log(userIds,"THIS IS USERID");
    return {
      schema,
      graphiql: true,
      isAdmin: true,
      context: {
        prisma,
        request,
        verifiedUserId: userIds ? userIds.userId : null
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
  this.team1 = {};
  this.team1[socketid.toString()] = player;
  this.team2 = {};
  this.approved = {};
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
  // console.log(socket, "THIS IS SOCKET")
  const id = await getUserId(socket.handshake);

  // console.log(id, "USERIDS SOCKETS");
  socket.on("reconnect", () => {
    if (activeUsers[id]) {
      let roomId = activeUsers[id].socketId;
      let oldSocketId = Object.keys(rooms[activeUsers[id].roomId].team1)[0];
      console.log(oldSocketId);
      delete activeUsers[id];
      activeUsers[id] = { [socket.id]: roomId };

      rooms[activeUsers[id][socket.id]].team1;
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
      id++
    // }
  });

  socket.on("joinRoom", (room) => {
    if (activeUsers[id]) {
      if (
        Object.keys(rooms[room].team2).length <
        Object.keys(rooms[room].team1).length
      ) {
        let player = new Player({ id, socketId: socket.id.toString() });
        rooms[room].team2[socket.id.toString()] = player;
        activeUsers[id] = new User({socketId: socket.id, room});
        socket.join(room);
      } else {
        let player = new Player({ id, socketId: socket.id.toString() });
        rooms[room].team1[socket.id.toString()] = player;
        activeUsers[id] = new User({socketId: socket.id, room});
        socket.join(room);
      }
      console.log(rooms[activeUsers[id].roomId])

      serverio.to(room).emit("updateLobby", rooms[activeUsers[id].roomId]);
      id++
    }
  });

  socket.on("leaveRoom", () => {
    socket.leave(activeUsers[id]);

    delete rooms[activeUsers[id].roomId].team1[socket.id];
    delete rooms[activeUsers[id].roomId].team2[socket.id];
    serverio
      .to(activeUsers[id].roomId)
      .emit("updateLobby", rooms[activeUsers[id].roomId]);
    delete activeUsers[id];
  });

  socket.on("switchStatus", () => {
    if (rooms[activeUsers[id].roomId].team1[socket.id]) {
      rooms[activeUsers[id].roomId].team1[socket.id].status = !rooms[
        activeUsers[id].roomId
      ].team1[socket.id].status;
    } else {
      rooms[activeUsers[id].roomId].team2[socket.id].status = !rooms[
        activeUsers[id].roomId
      ].team2[socket.id].status;
    }
    serverio
      .to(activeUsers[id].roomId)
      .emit("updateLobby", rooms[activeUsers[id].roomId]);
  });

  socket.on("startMatch", () => {
    if (
      Object.keys(rooms[activeUsers[id].roomId].team2).length ===
      Object.keys(rooms[activeUsers[id].roomId].team1).length
    ) {
      serverio.to(activeUsers[id].roomId).emit("startedMatch");
    }
  });

  socket.on("approveScore", () => {
    rooms[activeUsers[id][socket.id]].approved[socket.id] = true;
    if (
      Object.keys(rooms[activeUsers[id].roomId].approved).length >=
      (Object.keys(rooms[activeUsers[id].roomId].team1).length +
        Object.keys(rooms[activeUsers[id].roomId].team2).length) *
        0.75
    ) {
      //update db
      serverio.to(activeUsers[id].roomId).emit("approvedScore", {
        team1Score: rooms[activeUsers[id].roomId].team1.score,
        team2Score: rooms[activeUsers[id].roomId].team2.score,
      });
    }
  });

  socket.on("finalScore", (team1Score, team2Score) => {
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
