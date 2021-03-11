import getUserId from "../../utils/getUserId.js";

const lessee = {
  createLessee(parent, args, { prisma }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    const userId = 2;
    return prisma.lessee.create({
      data: {
        rating: 0,
        totalRatingCount: 0,
        User: {
          connect: {
            id: userId,
          },
        },
      },
    });
  },
};

export default lessee;
