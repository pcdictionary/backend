import {default as Auth} from './auth.js'
import {default as Mutations} from './mutations.js'
import {default as Owner} from './owner.js'
import {default as Queries} from './queries.js'
import {default as Misc} from './toBeDone.js'
import {default as User} from './user.js'

const typeDefs = [Auth, Mutations, Owner, Queries, Misc, User]

export default typeDefs;