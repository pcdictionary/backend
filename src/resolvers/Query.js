const Query = {
  allUsers(parent, args, { prisma }, info) {
    return prisma.user.findMany();
  },
  getUser(parent, args, { prisma }, info) {
    return prisma.user.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};

export default Query;
