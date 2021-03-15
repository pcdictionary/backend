import { resolvers } from "./resolvers/index.js";
import typeDefs from "./typeDefs/_typeDefs.js";
import express, { request } from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import pkg from "@prisma/client";
import cors from "cors";
import getUserId from "./utils/getUserId.js"

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  "/graphql",
  graphqlHTTP(async (request, response, graphQLParams) => {
    // console.log("app.user headers", request.headers);
    // console.log("params", graphQLParams);
    const userIds = await getUserId(request)
    console.log(userIds)
    return {
      schema,
      graphiql: true,
      isAdmin: true,
      context: { prisma, request, verifiedUserId: userIds ? userIds.userId : null,
      verifiedOwnerId: userIds ? userIds.ownerId: null,
      verifiedLesseeId: userIds ? userIds.lesseeId: null, },
    };
  })
);
app.listen(4000, () => [console.log("Server is running")]);
