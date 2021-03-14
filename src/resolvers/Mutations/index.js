import user from './user.js'
import item from './item.js'
import transaction from './transaction.js'
import owner from './owner.js'
import wishlist from './wishlist.js'
import lessee from './lessee.js'
import category from './category.js'

const Mutation = {
  ...user,
  ...item,
  ...transaction,
  ...owner,
  ...wishlist,
  ...lessee,
  ...category
};

export default Mutation;
