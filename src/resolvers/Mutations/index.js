import user from './user.js'
import item from './item.js'
import transaction from './transaction.js'

const Mutation = {
  ...user,
  ...item,
  ...transaction
};

export default Mutation;
