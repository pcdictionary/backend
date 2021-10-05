import { resolvers } from "./resolvers/index.js";
import typeDefs from "./typeDefs/_typeDefs.js";
import express, { request } from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import pkg from "@prisma/client";
import cors from "cors";
import getUserId from "./utils/getUserId.js";
import { v4 as uuidv4 } from "uuid";
import NodeCache from "node-cache";
import dotenv from "dotenv";
dotenv.config();
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});

export const loginStore = new NodeCache({ checkperiod: 1800 });
export const updateUserStore = new NodeCache({ checkperiod: 3600 });
const app = express();
loginStore.close();
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
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
      },
    };
  })
);

const port = process.env.PORT || 4000;
const hostname = "192.168.0.113";

if (process.env.PORT) {
  app.listen(port, () => {
    console.log(`SERVER IS RUNNING,${port}`);
  });
} else {
  app.listen(port, hostname, () => {
    console.log(`SERVER IS RUNNING,${port}`);
  });
}
