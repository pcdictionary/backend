const owner = {
    async allOwners (parent, args, { prisma }, info) {
        try {
            return await prisma.owner.findMany()
        } catch (error) {
            return error
        }
    },
    async getOwner(parent, args, { prisma }, info){
        try {
            const foundOwner = await prisma.owner.findUnique({
                where: {
                    id: args.ownerId
                }
            })
            return foundOwner ? foundOwner : new Error("No such user found.")
        } catch (error) {
            return error
        }
    }
}


export default owner