const user = {
  async allUsers(parent, args, { prisma }, info) {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      return error;
    }
  },

  async getUser(parent, args, { prisma, verifiedUserId }, info) {
    try {
      let query = {};
      console.log(verifiedUserId);
      if (verifiedUserId) query = { id: verifiedUserId };
      else return new Error("Invalid search parameters");
      const foundUser = await prisma.user.findUnique({
        where: {
          ...query,
        },
      });
      return foundUser ? foundUser : new Error("No such user found.");
    } catch (error) {
      return error;
    }
  },
};

export default user;
