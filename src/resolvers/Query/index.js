import elo from "./elo.js";
import games from "./games.js";
import user from "./user.js";

const Query = {
  ...user,
  ...games,
  ...elo
};

export default Query;
