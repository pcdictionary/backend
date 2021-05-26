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
            take: 3,
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
      const GAMETYPES = ["HANDBALL", "BASKETBALL", "SOCCER", "TENNIS", "PINGPONG"]
      let allGames = []
      console.log("ME HIT")
      const {userName} = await prisma.user.findUnique({
        where: {
          id: verifiedUserId,
        },
      });
      console.log({userName})
      for (let x = 0; x < GAMETYPES.length; x++){
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
        allGames.push(sport)
      }
      console.log(allGames,"THIS IS ALL GAMES")
      return allGames;
    } catch (error) {
      return error;
    }
  },
};

export default games;
