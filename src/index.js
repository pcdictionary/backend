import { resolvers } from "./resolvers/index.js";
import typeDefs from "./typeDefs.js";
import express, { request } from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});

const app = express();
app.use(
  "/graphql",
  graphqlHTTP(async (request, response, graphQLParams) => ({
    schema,
    graphiql: true,
    context: { prisma, request },
  }))
);
app.listen(4000, () => [console.log("Server is running")]);
