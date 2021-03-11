import getUserId from "../../utils/getUserId.js";
const cart = {
  async createCart(parent, args, { prisma }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    const userId = 2;

    return await prisma.cart.create({
      data: {
        paymentMethod: "",
        status: "ACTIVE",
        totalPrice: 0,
        lessee: {
          connect: {
            id: userId,
          },
        },
      },
    });
  },
};

export default cart;
