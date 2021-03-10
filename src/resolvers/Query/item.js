import getUserId from "../../utils/getUserId.js";
const item = {
  async allUserItems(parent, args, { prisma, request }, info) {
    const userId = await getUserId(request);
    if (!userId) {
      throw new Error("Login in to view Items!");
    }

    const items = await prisma.item.findMany({
      where: {
        ownerId: userId,
      },
    });
    return items;
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
