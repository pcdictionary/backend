import getUserId from "../../utils/getUserId.js";
const item = {
  allUserItems(parent, args, { prisma }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    const userId = 6

    return prisma.item.findMany({
      where: {
        ownderId: userId,
      },
    });
  },
  getItem(parent, args, { prisma }, info) {
    return prisma.item.findUnique({
      where: {
        id: args.id,
      },
    });
  },
  getCategories(parent, args, { prisma }, info) {
    return prisma.categories.findMany({
      where: {},
      distinct: ["category"],
    });
  },
};
export default item;
