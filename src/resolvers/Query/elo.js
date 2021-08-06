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
      const test = await prisma.user.findUnique({
        where: {
          userName: args.data.username,
        },
        include: {
          elo: true,
        },
      });
      let game =
        args.data.GameType.charAt(0).toUpperCase() +
        args.data.GameType.substring(1).toLowerCase();
      console.log(test, "THIS IS TEST");
      console.log(foundElo, "this is found elo");
      console.log(args.data.GameType, "GAMETYPE");
      foundElo.eloHistory.unshift({
        __typename: "EloHistory",
        eloHistory: test.elo[game],
      });
      return foundElo ? foundElo : new Error("No such user found.");
    } catch (error) {
      return error;
    }
  },
  async getLadder(parent, args, { prisma }, info) {
    try {
      let query = {};
      let game =
        args.data.GameType.charAt(0).toUpperCase() +
        args.data.GameType.substring(1).toLowerCase();

      let foundElo = await prisma.elo.findMany({
        take: 20,
        orderBy: {
          [game]: "desc",
        },
        include: {
          user: true,
        },
      });
      console.log(foundElo);

      return foundElo;
    } catch (error) {
      return error;
    }
  },
  async getLadderPagination(parent, args, { prisma }, info) {
    try {
      console.log(args.data, "THIS IS DATA");
      let query = {};
      let game =
        args.data.GameType.charAt(0).toUpperCase() +
        args.data.GameType.substring(1).toLowerCase();
      console.log(args.data.CurrentElo);
      let foundElo;
      if (args.data.CurrentElo >= 0) {
        console.log("THIS IS HIT");
        foundElo = await prisma.elo.findMany({
          take: 10,
          where: {
            [game]: {
              gt: args.data.CurrentElo,
            },
          },
          orderBy: {
            [game]: args.data.Direction ? "asc" : "desc",
          },
          include: {
            user: true,
          },
        });
      } else {
        foundElo = await prisma.elo.findMany({
          take: 20,
          orderBy: {
            [game]: "desc",
          },
          include: {
            user: true,
          },
        });
      }
      // console.log(foundElo);

      return foundElo;
    } catch (error) {
      return error;
    }
  },
};

export default elo;
