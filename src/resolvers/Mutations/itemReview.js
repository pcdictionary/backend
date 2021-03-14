import getUserId from "../../utils/getUserId.js";

const itemReview = {
    async createItemReview(parent, args, { prisma }, info){
            // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    const userId = 1;
        prisma.itemReview.create({
            data:{
                ...args.data,
                Lessee:{
                    connect:{
                        lesseeId: userId
                    }
                },
                Item:{
                    connect:{
                        itemId: args.itemId
                    }
                }
            }
        })
    }
}

export default itemReview