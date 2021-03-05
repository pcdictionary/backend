import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
const prisma = new PrismaClient();
const typeDefs = `
  type User {
    email: String!
    name: String
  }'
  type Item{

  }
  type Query {
    allUsers: [User!]!
    allItems : [I]
  }
`;
const resolvers = {
  Query: {
    allUsers: () => {
      return prisma.user.findMany();
    },
  },
};
export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});
const app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);
app.listen(4000);
