// import { Game } from '@prisma/client'

const games = {
  async getMatch(parent, args, { prisma }, info) {
    try {
      let query = {};
      if (args.id) query = { id: args.id };
      else return new Error("Invalid search parameters");

      const foundGames = await prisma.game.findUnique({
        where: {
          ...query,
        },
      });
      return foundGames;
    } catch (error) {
      return error;
    }
  },
  async getAllMatches(parent, args, { prisma }, info) {
    try {
      let query = {};
      if (args.data.id) query = { id: args.data.id };
      else return new Error("Invalid search parameters");
      const foundMatches = await prisma.user.findUnique({
        where: {
          ...query,
        },
        include: {
          allGames: {
            take: 3,
            where: {
              GameType: args.data.GameType,
            },
            orderBy: {
              id: "desc",
            },
          },
        },
      });
      return foundMatches.allGames ? foundMatches.allGames : new Error("This User has no recorded games");
    } catch (error) {
      return error;
    }
  },
};

export default games;
