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
    // console.log("app.user headers", request.headers);
    // console.log("params", graphQLParams);
    // const userIds = await getUserId(request);
    // console.log(userIds);
    return {
      schema,
      graphiql: true,
      isAdmin: true,
      context: {
        prisma,
        request,
        // verifiedUserId: userIds ? userIds.userId : null
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
let activeUsers = {};
serverio.on("connection", async (socket) => {
  // const userIds = await getUserId(socket.handshake);
  const id = 1;
  // console.log(userIds, "USERIDS SOCKETS");
  socket.on("createRoom", () => {
    if (!activeUsers[socket.id]) {
      let player = new Player({ id, socketId: socket.id.toString() });
      let room = uuidv4().toString();
      activeUsers[socket.id] = room;
      rooms[room] = new Teams(socket.id, player);
      socket.join(room);
      console.log(rooms);
      serverio.to(room).emit("createdRoom", room);
      serverio.to(room).emit("updateLobby", rooms[activeUsers[socket.id]]);
    }
  });

  socket.on("joinRoom", (room) => {
    if (!activeUsers[socket.id]) {
      if (
        Object.keys(rooms[room].team2).length <
        Object.keys(rooms[room].team1).length
      ) {
        let player = new Player({ id, socketId: socket.id.toString() });
        rooms[room].team2[socket.id.toString()] = player;
        console.log(rooms);
        activeUsers[socket.id] = room;
        socket.join(room);
      } else {
        let player = new Player({ id, socketId: socket.id.toString() });
        rooms[room].team1[socket.id.toString()] = player;
        console.log(rooms);
        activeUsers[socket.id] = room;
        socket.join(room);
      }
      serverio.to(room).emit("updateLobby", rooms[activeUsers[socket.id]]);
    }
    serverio.to(activeUsers[socket.id]).emit("updateLobby", rooms[activeUsers[socket.id]])
  })

  socket.on("leaveRoom", () => {
    socket.leave(activeUsers[socket.id]);

    delete rooms[activeUsers[socket.id]].team1[socket.id];
    delete rooms[activeUsers[socket.id]].team2[socket.id];
    serverio.to(activeUsers[socket.id]).emit("updateLobby", rooms[activeUsers[socket.id]]);
    delete activeUsers[socket.id];

  });

  socket.on("switchStatus", () => {
    if (rooms[activeUsers[socket.id]].team1[socket.id]) {
      rooms[activeUsers[socket.id]].team1[socket.id].status = !rooms[
        activeUsers[socket.id]
      ].team1[socket.id].status;
    } else {
      rooms[activeUsers[socket.id]].team2[socket.id].status = !rooms[
        activeUsers[socket.id]
      ].team2[socket.id].status;
    }
    serverio
      .to(activeUsers[socket.id])
      .emit("updateLobby", rooms[activeUsers[socket.id]]);
  });

  socket.on("startMatch", () => {
    if (
      Object.keys(rooms[room].team2).length ===
      Object.keys(rooms[room].team1).length
    ) {
      serverio.to(activeUsers[socket.id]).emit("startedMatch");
    }
  });

  socket.on("approveScore", () => {
    rooms[activeUsers[socket.id]].approved[socket.id] = true;
    if (
      Object.keys(rooms[activeUsers[socket.id]].approved).length >=
      (Object.keys(rooms[activeUsers[socket.id]].team1).length +
        Object.keys(rooms[activeUsers[socket.id]].team2).length) *
        0.75
    ) {
      //update db
      serverio
        .to(activeUsers[socket.id])
        .emit("approvedScore", {
          team1Score: rooms[activeUsers[socket.id]].team1.score,
          team2Score: rooms[activeUsers[socket.id]].team2.score,
        });
    }
  });

  socket.on("finalScore", (team1Score, team2Score) => {
    rooms[activeUsers[socket.id]].team1.score = team1Score;
    rooms[activeUsers[socket.id]].team2.score = team2Score;
    rooms[activeUsers[socket.id]].approved[socket.id] = true;
    serverio
      .to(activeUsers[socket.id])
      .emit("finalizedScore", { team1Score, team2Score });
  });

  socket.on("leaveRoom", () => {
    socket.leave(activeUsers[socket.id]);

    delete rooms[activeUsers[socket.id]].team1[socket.id];
    delete rooms[activeUsers[socket.id]].team2[socket.id];
    serverio
      .to(activeUsers[socket.id])
      .emit("updateLobby", rooms[activeUsers[socket.id]]);
    delete activeUsers[socket.id];
  });

  console.log("a user connected", socket.id);
});
const hostname = "192.168.0.110";
server.listen(4000, hostname, () => [console.log("Server is running")]);
