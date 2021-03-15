import user from "./user.js";
import item from "./item.js";
import chat from "./chat.js";
import owner from "./owner.js";

const Query = {
  ...user,
  ...item,
  ...chat,
  ...owner,
};

export default Query;
