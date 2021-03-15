import user from "./user.js";
import item from "./item.js";
import transaction from "./transaction.js";
import cart from "./cart.js";
import lessee from "./lessee.js";
import chat from "./chat.js";

const Mutation = {
  ...user,
  ...item,
  ...transaction,
  ...cart,
  ...lessee,
  ...chat,
};

export default Mutation;
