function generateSearchQuery(request){
    let searchQuery = {}
    if(request.verifiedOwnerId && request.verifiedUserId) searchQuery = {id:request.verifiedOwnerId}
    else if(request.verifiedUserId) searchQuery = {userId: request.verifiedUserId}
    else return new Error("Please login!")
    return searchQuery
}
function checkForInvalidValues(data){
    if(data.rating && data.rating<0) return 1
    if(data.totalRatingCount && data.totalRatingCount<0) return 1
    if(data.totalRatingCount === 0 && data.rating!==0) return 1
    return 0
}

const owner = {
    async createOwner(parent, args, {prisma, request}, info){
        try {
            const ownerAlreadyExists = await prisma.owner.findUnique(
                {
                  where:{userId:request.verifiedUserId},
                }
                )
            if(ownerAlreadyExists) throw new Error("User already has an Owner account attached.")
            const isError = checkForInvalidValues(args.data)
            if(isError) throw new Error("Got invalid value.")
            const owner = await prisma.owner.create({
                data:{
                    userId:request.verifiedUserId, ...args.data
                }
            })
            return owner
        } catch (error) {
            return error
        }
    },

    async updateOwner(parent, args, {prisma, request}, info){
        try {
            const searchQuery = generateSearchQuery(request)
            if(searchQuery.message) return searchQuery
            const isValueError = checkForInvalidValues(args.data)
            if(isValueError) throw new Error("Got invalid value.")
            const updatedOwner = await prisma.owner.update({
                where:{
                    ...searchQuery
                },
                data: {...args.data}
            }, info)
            return updatedOwner
        } catch (error) {
            return error
        }
    },

    async deleteOwner(parent, args, {prisma, request}, info){
        try {
            const searchQuery = generateSearchQuery(request)
            if(searchQuery.message) return searchQuery
            return await prisma.owner.delete({where:{...searchQuery}})
        } catch (error) {
            return error    
        }
    }
}

export default owner 