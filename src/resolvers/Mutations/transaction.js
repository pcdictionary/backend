import getUserId from "../../utils/getUserId.js";

const transaction = {
  async createTransaction(parent, args, { prisma }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    const userId = 2;

    const owner = await prisma.owner.findUnique({
      where: {
        userId: userId,
      },
    });
    const lessee = await prisma.lessee.findUnique({
      where: {
        userId: userId,
      },
    });

    console.log(lessee)

    return prisma.transaction.create({
      data: {
        ...args.data,
        Owner: {
          connect: {
            id: owner.id
          },
        },
        Item: {
          connect: {
            id: args.itemId,
          },
        },
        Lessee:{
          connect: {
            id: lessee.id
          }
        }
      },
      include: {
        Owner: true,
        Lessee: true
      },
    });
  },
  deleteTransaction(parent, args, { prisma }, info){
    return prisma.transaction.delete({ where: { id: args.transactionId } });
  }
};
export default transaction;
