// import { Game } from '@prisma/client'

// import { GAMETYPES } from "../../utils/constants";

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
      if (args.data.username) query = { userName: args.data.username };
      else return new Error("Invalid search parameters");
      const foundMatches = await prisma.user.findUnique({
        where: {
          ...query,
        },
        include: {
          allGames: {
            take: 5,
            where: {
              GameType: args.data.GameType,
            },
            orderBy: {
              id: "desc",
            },

            include: {
              users: true,
              users2: true,
            },
          },
        },
      });

      return foundMatches.allGames
        ? foundMatches.allGames
        : new Error("This User has no recorded games");
    } catch (error) {
      return error;
    }
  },

  async getAllMatchesPagination(parent, args, { prisma }, info) {
    try {
      let query = {};
      if (args.data.username) query = { userName: args.data.username };
      else return new Error("Invalid search parameters");
      const foundMatches = await prisma.user.findUnique({
        where: {
          ...query,
        },
        include: {
          allGames: {
            skip: 1,
            take: 5,

            cursor: {
              id: args.data.page,
            },
            where: {
              GameType: args.data.GameType,
            },
            orderBy: {
              id: "desc",
            },
            include: {
              users: true,
              users2: true,
            },
          },
        },
      });

      return foundMatches.allGames
        ? foundMatches.allGames
        : new Error("This User has no recorded games");
    } catch (error) {
      return error;
    }
  },
  async getMatchesCount(parent, args, { prisma, verifiedUserId }, info) {
    try {
      const GAMETYPES = [
        "HANDBALL",
        "BASKETBALL",
        "TENNIS",
        "PINGPONG",
        "AMERICANFOOTBALL",
        "FOOTBALL",
        "BASEBALL",
        "VOLLEYBALL",
        "BOXING",
        "CRICKET",
        "RUGBY",
        "WRESTLING",
        "HOCKEY",
        "BADMINTON",
        "DODGEBALL",
        "RACQUETBALL",
        "FENCING",
        "FRISBY",
        "LACROSSE",
        "SQUASH",
      ];
      let allGames = [];
      const { userName } = await prisma.user.findUnique({
        where: {
          id: verifiedUserId,
        },
      });
      for (let x = 0; x < GAMETYPES.length; x++) {
        const sport = await prisma.elo.findUnique({
          where: {
            username: userName,
          },
          include: {
            eloHistory: {
              where: {
                GameType: GAMETYPES[x],
              },
            },
          },
        });
        allGames.push(sport);
      }
      return allGames;
    } catch (error) {
      return error;
    }
  },async findGame(parent, args, { prisma, request, verifiedUserId }, info) {
    const foundGame = await prisma.game.findUnique({
      where: { id: args.id },
    });
    return foundGame;
  },
};

export default games;
