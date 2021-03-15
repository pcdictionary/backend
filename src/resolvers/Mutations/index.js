import user from "./user.js";
import item from "./item.js";
import transaction from "./transaction.js";
import wishlist from "./wishlist.js";
import lessee from "./lessee.js";
import category from "./category.js";
import itemReview from "./itemReview.js";
import chat from "./chat.js";
import owner from "./owner.js";

const Mutation = {
  ...user,
  ...item,
  ...transaction,
  ...chat,
  ...owner,
  ...wishlist,
  ...lessee,
  ...category,
  ...itemReview,
};

export default Mutation;
