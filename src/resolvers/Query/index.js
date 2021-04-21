import games from "./games.js";
import user from "./user.js";

const Query = {
  ...user,
  ...games
};

export default Query;
