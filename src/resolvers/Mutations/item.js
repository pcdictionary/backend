import getUserId from "../../utils/getUserId.js";
const item = {
  createItem(parent, args, { prisma, request }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }

    const userId = 17;

    return prisma.item.create({
      data: {
        ...args.data,
        Owner: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        Owner: true,
      },
    });
  },
  updateItem(parent, args, { prisma, request }, info) {
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
  createItemCategory(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    return prisma.itemCategoryId.create({
      data: {
        Item: {
          connect: {
            id: args.data.itemId,
          },
        },
        Category: {
          connect: {
            id: args.data.categoryId,
          },
        },
      },
      include: {
        ItemCategoryId: true,
        Category: true,
      },
    });
  },
  createCategory(parent, args, { prisma }, info) {
    return prisma.category.create({
      data: {
        ...args.data,
      },
    });
  },
  // createSubcategory(parent, args, {prisma}, info){
  //   return prisma.SubCategory.create({
  //     data:{
  //       Category:{

  //       }
  //     }
  //   })
  // }
};
export default item;
