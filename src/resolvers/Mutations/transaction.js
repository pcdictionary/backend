import getUserId from "../../utils/getUserId.js";

const transaction = {
  async createTransaction(parent, args, { prisma }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    const userId = 1;

    return prisma.transaction.create({
      data: {
        ...args.data,
        Cart: {
          connect: {
            where: {
              activecart: {
                lesseeId: userId,
                status: "ACTIVE",
              },
            },
          },
        },
        Owner: {
          connect: {
            id: args.ownerId,
          },
        },
        Item: {
          connect: {
            id: args.itemId,
          },
        },
      },
      include: {
        Owner: true,
      },
    });
  },
};
export default transaction;
