const category ={
      async createCategory(parent, args, { prisma, request }, info) {
        if(!request.isAdmin) return new Error("Insufficient rights")
        if(args.data && args.data.id && (args.data.id===args.data.parentCategoryId)) return new Error("Invalid parent category")
        try {
          return await prisma.category.create({
            data: {
              ...args.data,
            },
          });
        } catch (error) {
          return error
        }
      },
      async updateCategory(parent, args, { prisma, request }, info){
        if(!request.isAdmin) return new Error("Insufficient rights")
        if(args.data && args.catId!==undefined && (args.catId===args.data.parentCategoryId)) return new Error("Invalid parent category")
        try {
          return await prisma.category.update({
            where:{
              id: args.catId
            },
            data:{
              category:args.data.category,
              approved:args.data.approved,
              parentCategoryId:args.data.parentCategoryId
            } 
          })
        } catch (error) {
          return error
        }
      },
      async deleteCategory(parent, args, { prisma, request }, info){
        if(!request.isAdmin) return new Error("Insufficient rights")
        try {
          return await prisma.category.delete({
            where:{
              id: args.catId
            }
          })
        } catch (error) {
          return error
        }
      },
//       async createSubcategory(parent, args, { prisma }, info) {
//         const category = await prisma.category.create({
//           data: {
//             category: args.data.category,
//             parentCategory: {
//               connect: {
//                 id: args.data.parentCategoryId,
//               },
//             },
//           },
//           include: {
//             parentCategory: {
//               select: {
//                 category: true,
//                 subCategory: true,
//               },
//             },
//           },
//         });
    
//         return category;
//       },
}

export default category