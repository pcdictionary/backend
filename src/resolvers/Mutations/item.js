import getUserId from "../../utils/getUserId.js";
const item = {
  async createItem(parent, args, { prisma, request }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }

    const userId = 24;

    const item = await prisma.item.create({
      data: {
        ...args.data,
        Owner: {
          connect: {
            id: userId,
          },
        },
        Categories: {
          connect: [{ id: args.categoryId }],
        },
      },
      include: {
        Owner: {
          select: {
            id: true,
            User: true,
          },
        },
        Categories: true,
      },
    });

    return item;
  },
  updateItem(parent, args, { prisma, request }, info) {
    //should we validate only with user?
    const userId = getUserId(request);

    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }

    return prisma.item.update(
      {
        where: {
          id: args.data.id,
        },
        data: args.data,
      },
      info
    );
  },
  deleteItem(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    return prisma.item.delete({ where: { id: args.data.id } });
  },
  createCategory(parent, args, { prisma }, info) {
    return prisma.category.create({
      data: {
        ...args.data,
      },
    });
  },
  async createSubcategory(parent, args, { prisma }, info) {
    const category = await prisma.category.create({
      data: {
        category: args.data.category,
        parentCategory: {
          connect: {
            id: args.data.parentCategoryId,
          },
        },
      },
      include: {
        parentCategory: {
          select: {
            category: true,
            subCategory: true,
          },
        },
      },
    });

    return category;
  },
};
export default item;
