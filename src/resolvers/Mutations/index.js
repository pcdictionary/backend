import user from "./user.js";
import item from "./item.js";
import transaction from "./transaction.js";
import wishlist from "./wishlist.js";
import lessee from "./lessee.js";
import category from "./category.js";
import itemReview from "./itemReview.js";
import chat from "./chat.js";

const Mutation = {
  ...user,
  ...item,
  ...transaction,
  ...chat,
  ...wishlist,
  ...lessee,
  ...category,
  ...itemReview,
};

export default Mutation;
