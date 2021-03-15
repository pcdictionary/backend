import getUserId from "../../utils/getUserId.js";

const itemReview = {
  async createItemReview(parent, args, { prisma }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }

    const userId = 2;

    const lessee = await prisma.lessee.findUnique({
      where: {
        userId: userId,
      },
    });

    console.log(lessee,'this is lesseee')

    const transaction = await prisma.transaction.findUnique({
      where: {
        lesseeTransaction: {
          lesseeId: lessee.id,
          itemId: args.itemId,
        },
      },
    });
    console.log(transaction,'this is transaction')

    if (!transaction) {
      throw new Error("Never bought item");
    }
    return prisma.itemReview.create({
      data: {
        ...args.data,
        Lessee: {
          connect: {
            id: lessee.id,
          },
        },
        Item: {
          connect: {
            id: args.itemId,
          },
        },
      },
    });
  },
};

export default itemReview;
