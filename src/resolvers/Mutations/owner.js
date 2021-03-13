import {default as userMutations} from './user.js'
import {default as userQueries} from '../Query/user.js'

const owner = {
    async createOwner(parent, args, {prisma, request}, info){
        try {
            const currentUser = await userQueries.getUser(undefined, {id:request.verifiedUserId},
                {prisma})
            if(currentUser.Owner!==undefined) throw new Error("User already has Owner account")
            const owner = await prisma.owner.create({
                data:{
                    userId:request.verifiedUserId, ...args.data
                }
            })
            await userMutations.updateUser(undefined, {data:{Owner:owner}}, {prisma, request})
            return owner
        } catch (error) {
            return error
        }
    },
    async deleteOwner(parent, args, {prisma, request}, info){
        try {
            if(!request.verifiedUserId){
                return new Error("Log in to delete Account!")
            }
            return await prisma.owner.delete({where:{userId:request.verifiedUserId}})
        } catch (error) {
            return error    
        }
    }
}

export default owner 