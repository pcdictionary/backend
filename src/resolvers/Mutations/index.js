import user from './user.js'
import item from './item.js'
import transaction from './transaction.js'
import owner from './owner.js'

const Mutation = {
  ...user,
  ...item,
  ...transaction,
  ...owner
};

export default Mutation;
