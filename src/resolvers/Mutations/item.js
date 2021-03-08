import getUserId from "../../utils/getUserId.js";
const item = {
  async createItem(parent, args, { prisma, request }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }

<<<<<<< HEAD
    const userId = 6;
=======
    const userId = 28;
>>>>>>> af348b1c62caa6eaae1b6a572f3c355ff6449f1d

    const item = await prisma.item.create({
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
        ItemCategory: true
      },
    });
    await prisma.itemCategory.update({
<<<<<<< HEAD
      where: {
        categoryId: args.categoryId
      },
      data:{
        Item:{
          connect:{
            id: item.id
          }
        }
      },
      include:{
        Item: true
      }
    })
    return item
=======
      data: {
        Item: {
          connect: {
            id: item.id,
          },
        },
        Category: {
          connect: {
            id: args.categoryId,
          },
        },
      },
    });
    return item;
>>>>>>> af348b1c62caa6eaae1b6a572f3c355ff6449f1d
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
  createItemCategory(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    return prisma.itemCategory.create({
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
        Item: true,
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
  //       SubCategory:{
  //         connect:{
  //           id:
  //         }
  //       }
  //     }
  //   })
  // }
};
export default item;
