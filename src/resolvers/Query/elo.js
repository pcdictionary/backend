const elo = {
  async getEloHistory(parent, args, { prisma }, info) {
    try {
      let query = {};
      let foundElo;
      if (args.data.datapoints === -1) {
        foundElo = await prisma.elo.findUnique({
          where: {
            username: args.data.username,
          },
          include: {
            eloHistory: {
              where: {
                GameType: args.data.GameType,
              },
              orderBy: {
                id: "desc",
              },
            },
          },
        });
      } else {
        foundElo = await prisma.elo.findUnique({
          where: {
            username: args.data.username,
          },
          include: {
            eloHistory: {
              take: args.data.datapoints,
              where: {
                GameType: args.data.GameType,
              },
              orderBy: {
                id: "desc",
              },
            },
          },
        });
      }
      return foundElo;
    } catch (error) {
      return error;
    }
  },
  async getLadder(parent, args, { prisma }, info) {
    try {
      let query = {};
      let game = args.data.GameType.charAt(0).toUpperCase() + args.data.GameType.substring(1).toLowerCase();
    
      let foundElo = await prisma.elo.findMany({
        take: 20,
        orderBy: {
          [game]: "desc",
        },
      });

      return foundElo;
    } catch (error) {
      return error;
    }
  },
};

export default elo;
