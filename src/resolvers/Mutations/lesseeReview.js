import getUserId from "../../utils/getUserId.js";

const lesseeReview = {
  async createLesseeReview(parent, args, { prisma }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    try {
      const userId = 2;

      const owner = await prisma.owner.findUnique({
        where: {
          userId: userId,
        },
      });

      const lessee = await prisma.lessee.findUnique({
        where: {
          userId: args.lesseeId,
        },
      });

      const transaction = await prisma.transaction.findUnique({
        where: {
          reviewTransaction: {
            ownerId: owner.id,
            itemId: args.itemId,
            lesseeId: lessee.id,
          },
        },
      });

      if (!transaction) {
        throw new Error("Never bought item");
      }
      return prisma.lesseeReview.create({
        data: {
          ...args.data,
          Lessee: {
            connect: {
              lesseeId: lessee.id,
            },
          },
          ProductOwner: {
            connect: {
              productOwnerId: owner.id,
            },
          },
        },
      });
    } catch (error) {
      return error;
    }
  },
  async updateLesseeReview(parent, args, { prisma }, info) {
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

    return prisma.lesseeReview.update({
      where: {
        lesseeOwnerReview: {
          productOwnerId: owner.id,
          id: args.lesseeReviewId,
        },
      },
      data: {
        ...args.data,
      },
    });
  },
  deleteLesseeReview(parent, args, { prisma }, info){
    return prisma.lesseeReview.delete({
      where: {
        id: args.lesseeReviewId,
        // ownerId: ownerId
      }
    })
  }
};

export default lesseeReview;
