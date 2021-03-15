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

    const transaction = await prisma.transaction.findUnique({
      where: {
        lesseeTransaction: {
          lesseeId: lessee.id,
          itemId: args.itemId,
        },
      },
    });

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
  async updateItemReview(parent, args, { prisma }, info){
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

    return prisma.itemReview.update({
      where:{
        // itemReview:{
          id: args.itemReviewId,
          // ownerId: owner.id
        // }
      },
      data: {
        ...args.data
      },
    });
  },
  deleteItemReview(parent, args, { prisma }, info){
    return prisma.itemReview.delete({
      where: {
        id: args.itemReviewId,
        // lesseeId: lesseeId
      }
    })
  }
};

export default itemReview;
