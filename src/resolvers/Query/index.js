import user from "./user.js";
import item from "./item.js";
import chat from "./chat.js";

const Query = {
  ...user,
  ...item,
  ...chat,
};

export default Query;
