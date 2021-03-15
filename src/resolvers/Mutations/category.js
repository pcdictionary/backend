const category ={
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
}

export default category