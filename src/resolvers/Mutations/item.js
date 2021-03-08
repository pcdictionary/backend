import getUserId from "../../utils/getUserId.js";
const item = {
  async createItem(parent, args, { prisma, request }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }

    const userId = 2;

    const item = await prisma.item.create({
      data: {
        ...args.data,
        Owner: {
          connect: {
            id: userId,
          },
        }
      },
      include: {
        Owner: true,
      },
    });
    await prisma.itemCategory.update({
      where: {
        categoryId: args.categoryId
      },
      data:{
        item:{
          connect:{
            id: item.id
          }
        }
      },
      include:{
        item:{
          item: true
        }
      }
    })
    return item
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
