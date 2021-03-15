const item = {
  async createItem(parent, args, { prisma, request, verifiedUserId }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }

    const userId = verifiedUserId

    const item = await prisma.item.create({
      data: {
        ...args.data,
        Owner: {
          connect: {
            userId: userId,
          },
        },
        Categories: {
          connect: [{ id: args.categoryId }],
        },
      },
      include: {
        Owner: {
          select: {
            userId: true,
            User: true,
          },
        },
        Categories: true,
      },
    });

    return item;
  },
  async updateItem(parent, args, { prisma, request }, info) {
    //should we validate only with user?
    // const userId = getUserId(request);

    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    const userId = 1;

    const owner = await prisma.owner.findUnique({
      where: {
        userId: userId,
      },
    });

    console.log(owner, "this is ownerrrrrrrrrr");

    if (args.categoryId) {
      return prisma.item.update({
        where: {
          itemOwner: {
            id: args.itemId,
            ownerId: owner.id,
          },
        },
        data: {
          ...args.data,
          // Owner: {
          //   connect: {
          //     userId: userId,
          //   },
          // },
          Categories: {
            connect: [{ id: args.categoryId }],
          },
        },
        include: {
          Owner: {
            select: {
              userId: true,
              User: true,
            },
          },
          Categories: true,
        },
      });
    } else {
      return prisma.item.update(
        {
          where: {
            id: args.data.id,
          },
          data: args.data,
          include: {
            Owner: {
              select: {
                userId: true,
                User: true,
              },
            },
            Categories: true,
          },
        },
        info
      );
    }
  },
  deleteItem(parent, args, { prisma, request, verifiedUserId }, info) {
    const userId = verifiedUserId
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
    return prisma.item.delete({ where: { id: args.data.id } });
  },
};
export default item;
