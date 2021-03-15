import getUserId from "../../utils/getUserId.js";
const wishlist = {
  async createWishList(parent, args, { prisma }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    const userId = 2;

    return await prisma.wishList.create({
      data: {
        totalPrice: 0,
        User: {
          connect: {
            id: userId,
          },
        },
      },
      include:{
        User: true
      }
    });
  },
};

export default wishlist;
