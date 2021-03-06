import getUserId from "../../utils/getUserId.js"
const item = {
  async createItem(parent, args, { prisma, request }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }

    const userId = 17;
    const owner = await prisma.owner.findUnique({
      where: {
        id: userId,
      },
    });
    return prisma.item.create({
      data: {
        ...args.data,
        Owner: {
          connect: {
            id: owner.id,
          },
        },
      },
      include: {
        Owner: true,
      },
    });
  },
//   async updateItem(parent, args, { prisma, request }, info) {
//     const userId = getUserId(request);

//     if (typeof args.data.password === "string") {
//       args.data.password = await hashPassword(args.data.password);
//     }

//     return prisma.item.update(
//       {
//         where: {
//           id: args.data.itemId,
//         },
//         data: args.data,
//       },
//       info
//     );
//   },
};
export default item;
