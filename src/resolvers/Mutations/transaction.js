import getUserId from "../../utils/getUserId.js";

const transaction = {
  async createTransaction(parent, args, { prisma }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    const userId = 1;
    const cart = await prisma.cart.upsert({
      where: {
        id: userId,
        status: "ACTIVE"
      },
      create:{
          Lessee:{
              connect:{
                  id: userId
              }
          },
          status: "ACTIVE",
          paymentMethod: args.paymentMethod,
          totalPrice: args.totalPrice
      }
    });

    const transaction = await prisma.transaction.create({
        data:{
            ...args.data,
            Cart: {
                connect:{
                    id: cart.id
                }
            },
            Item: {
                connect: {
                    id: args.itemId
                }
            },
            Owner: {
                connect: {
                    id: args.ownerId
                }
            }
        }
    })
    return transaction
  },
};
export default transaction;
