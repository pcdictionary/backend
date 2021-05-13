import location from "../Query/location.js";
import elo from "./elo.js";
import games from "./games.js";
import user from "./user.js";

const Query = {
  ...user,
  ...games,
  ...elo,
  ...location
};

export default Query;
