import user from "./user.js";
import game from "./game.js"
import location from "./location.js";

const Mutation = {
  ...user,
  ...game,
  ...location
};

export default Mutation;
