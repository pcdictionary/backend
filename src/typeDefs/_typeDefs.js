import { default as Auth } from "./auth.js";
import { default as Mutations } from "./mutations.js";
import { default as Queries } from "./queries.js";
import { default as User } from "./user.js";
import { default as Enum } from "./enum.js";
import { default as Elo } from "./elo.js";
import { default as Game } from "./game.js";

const typeDefs = [Auth, Mutations, Queries, User, Elo, Game, Enum];

export default typeDefs;
