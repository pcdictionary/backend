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
serverio.on("connection", async (socket) => {
  const userIds = await getUserId(socket.handshake);
  console.log(userIds, "USERIDS SOCKETS");
  socket.on("createRoom", () => {
    console.log(socket.rooms);
    if (socket.rooms.size < 2) {
      let room = uuidv4();
      socket.join(room);
      serverio.to(room).emit("createdRoom", room);
    }
  });
  socket.on("test", () => {
    console.log("THIS IS FIRST SOCKET CONNECTION");
  });
  console.log("a user connected");
});
const hostname = "192.168.0.110";
server.listen(4000, hostname, () => [console.log("Server is running")]);
