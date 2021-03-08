import getUserId from "../../utils/getUserId.js";
const item = {
  async createItem(parent, args, { prisma, request }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }

    const userId = 1;

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
    await prisma.itemCategory.create({
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
  // createItemCategory(parent, args, { prisma, request }, info) {
  //   const userId = getUserId(request);
  //   // if (!userId) {
  //   //   throw new Error("Login in to delete Account!");
  //   // }
  //   return prisma.itemCategory.create({
  //     data: {
  //       Item: {
  //         connect: {
  //           id: args.data.itemId,
  //         },
  //       },
  //       Category: {
  //         connect: {
  //           id: args.data.categoryId,
  //         },
  //       },
  //     },
  //     include: {
  //       Item: true,
  //       Category: true,
  //     },
  //   });
  // },
  createCategory(parent, args, { prisma }, info) {
    return prisma.category.create({
      data: {
        ...args.data,
      },
    });
  },
  async createSubcategory(parent, args, {prisma}, info){
    console.log(args.data)
    const subCategory = await prisma.category.create({
      data:{
          category: args.data.category,
          ParentCategory:{
            connectOrCreate: {
              create:{
                parentCategoryId: args.data.parentCategoryId
              }
            }
          }
        }
      })
      console.log(subCategory)
      await prisma.subCategory.create({
        data:{
          ParentCategory:{
            connect:{
              id: args.data.parentCategoryId
            }
          },
          SubCategory:{
            connect: {
              id: subCategory.id
            }
          }
        }
      })
      
      return subCategory
  }
};
export default item;
