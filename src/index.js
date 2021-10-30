import { resolvers } from "./resolvers/index.js";
import typeDefs from "./typeDefs/_typeDefs.js";
import express, { request } from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import pkg from "@prisma/client";
import cors from "cors";
import getUserId from "./utils/getUserId.js";
import { Trie } from "./utils/trie.js";
import NodeCache from "node-cache";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});

export const wordIdCursor = new NodeCache({ checkperiod: 1800 });
export const allWords = new NodeCache({ checkperiod: 86400 });
export const wordCount = new NodeCache({checkperiod: 86400})
let allWordsTrie = new Trie();

const buildAllWordsTrie = async () => {
  const words = await prisma.word.findMany({});
  wordCount.set("wordCount", words.length, 86400)
  for (const { word } of words) {
    allWordsTrie.insert(word);
  }
  allWords.set("allWords", allWordsTrie, 86400);
};

buildAllWordsTrie();


allWords.on("expired", async function (key, value) {
  allWordsTrie = new Trie();
  buildAllWordsTrie();
});
export const loginStore = new NodeCache({ checkperiod: 1800 });
export const updateUserStore = new NodeCache({ checkperiod: 3600 });
const app = express();
loginStore.close();
app.use(express.json());
app.use(cookieParser());
const options = {
  origin: ["https://euphemaryadmin.herokuapp.com/", "https://euphemaryfrontend.herokuapp.com/"],
  credentials: true,
  methods: "GET,HEAD,POST,PATCH,DELETE,OPTIONS",
};
app.options("/graphql", cors(options))
app.use(cors(options));

app.use(
  "/graphql",
  cors(options),
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
