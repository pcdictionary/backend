const chat = {
  async createChat(parent, args, { prisma }, info) {
    try {
      // const userId = getUserId(request);
      // if (!userId) {
      //   throw new Error("Login in to delete Account!");
      // }
      const userId = 1;

      return await prisma.chat.create({
        data: {
          User1: {
            connect: {
              id: userId,
            },
          },
          User2: {
            connect: {
              id: args.reciever,
            },
          },
          messageCount: 0,
        },
        include: {
          User1: true,
          User2: true,
        },
      });
    } catch (error) {
      return error;
    }
  },
  async createMessage(parent, args, { prisma }, info) {
    try {
      // const userId = getUserId(request);
      // if (!userId) {
      //   throw new Error("Login in to delete Account!");
      // }
      const userId = 1;

      return await prisma.chat.update({
        where: {
          id: args.data.chatId,
        },
        data: {
          messageCount: {
            increment: 1,
          },
          Message: {
            create: {
              message: args.data.message,
              User: {
                connect: {
                  id: userId,
                },
              },
            },
          },
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
  async deleteChat(parent, args, { prisma }, info) {
    try {
      // const userId = getUserId(request);
      // if (!userId) {
      //   throw new Error("Login in to delete Account!");
      // }
      const userId = 1;

      const deleted = prisma.chat.delete({
        where: {
          id: args.chatId,
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
      });
      if (!deleted) {
        throw new Error("Couldn't delete chat");
      }
    } catch (error) {
      return error;
    }
  },
  async deleteMessage(parent, args, { prisma }, info) {
    try {
      // const userId = getUserId(request);
      // if (!userId) {
      //   throw new Error("Login in to delete Account!");
      // }
      const userId = 1;

      const deleted = await prisma.message.delete({
        where: { id: args.messageId, userId: userId },
      });

      if (!deleted) {
        throw new Error("Couldn't delete chat");
      }

      return deleted;
    } catch (error) {
      return error;
    }
  },
};

export default chat;
