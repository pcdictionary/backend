const chat = {
  async allChats(parent, args, { prisma }, info) {
    try {
      // const userId = getUserId(request);
      // if (!userId) {
      //   throw new Error("Login in to delete Account!");
      // }
      const userId = 1;
      return await prisma.chat.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        include: {
          Message: true,
          User1: true,
          User2: true,
        },
      });
    } catch (error) {
      return error;
    }
  },
};

export default chat;
