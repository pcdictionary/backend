import user from './user.js'
import item from './item.js'
import owner from './owner.js'

const Query = {
    ...user,
    ...item,
    ...owner
}

export default Query