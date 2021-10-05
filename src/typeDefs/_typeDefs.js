import { default as Auth } from "./auth.js";
import { default as Mutations } from "./mutations.js";
import { default as Queries } from "./queries.js";
import { default as User } from "./user.js";

const typeDefs = [
  Auth,
  Mutations,
  Queries,
  User,
];

export default typeDefs;
