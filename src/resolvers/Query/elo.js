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
      let foundElo;
      let game =
        args.data.GameType.charAt(0).toUpperCase() +
        args.data.GameType.substring(1).toLowerCase();
      if (args.data.CurrentElo >= 0) {
        foundElo = await prisma.elo.findMany({
          take: 10,
          where: {
            [game]: {
              gt: args.data.CurrentElo,
            },
          },
          orderBy: [{ [game]: "asc" }, { username: "desc" }],
          include: {
            user: true,
          },
        });
      } else {
        foundElo = await prisma.elo.findMany({
          take: 20,
          orderBy: [{ [game]: "desc" }, { username: "asc" }],
          include: {
            user: true,
          },
        });
      }
      if (!foundElo) {
        new Error("No such ranks found.");
      }

      return foundElo;
    } catch (error) {
      return error;
    }
  },
  async getLadderPagination(parent, args, { prisma }, info) {
    try {
      let query = {};
      let game =
        args.data.GameType.charAt(0).toUpperCase() +
        args.data.GameType.substring(1).toLowerCase();
      let foundElo;
      if (args.data.CurrentElo >= 0) {
        if(args.data.Direction){
        foundElo = await prisma.elo.findMany({
          take: 10,
          skip: 1,
          cursor: {
            username: args.data.userName,
          },
          where: {
            [game]: {
              gte: args.data.CurrentElo,
            },
          },

          orderBy: [
            { [game]: "asc" },
            { username: "desc" },
          ],
          include: {
            user: true,
          },
        })}else{
          foundElo = await prisma.elo.findMany({
            take: -10,
            skip: 1,
            cursor: {
              username: args.data.userName,
            },
            where: {
              [game]: {
                lte: args.data.CurrentElo,
              },
            },
  
            orderBy: [
              { [game]: "asc" },
              { username: "desc" },
            ],
            include: {
              user: true,
            },
          })
        };
      } else {
        foundElo = await prisma.elo.findMany({
          take: 20,
          orderBy: [{ [game]: "desc" }, { username: "asc" }],
          include: {
            user: true,
          },
        });
      }
      if (!foundElo) {
        new Error("No such ranks found.");
      }
      return foundElo;
    } catch (error) {
      return error;
    }
  },
  async getRanksByUser(parent, args, { prisma }, info) {
    try {
      let game =
        args.data.GameType.charAt(0).toUpperCase() +
        args.data.GameType.substring(1).toLowerCase();

      let userfound = await prisma.user.findUnique({
        where: {
          userName: args.data.userName,
        },
        include: {
          elo: true,
        },
      });
      if (!userfound) {
        new Error("No such user found.");
      }

      let foundRanks = await prisma.elo.findMany({
        take: 10,
        cursor: {
          username: args.data.userName,
        },
        where: {
          [game]: {
            lte: userfound[game],
          },
        },
        orderBy: [{ [game]: "asc" }, { username: "desc" }],
        include: {
          user: true,
        },
      });
      if (!foundRanks) {
        new Error("No such ranks found.");
      }

      return foundRanks;
    } catch (error) {
      return error;
    }
  },
};

export default elo;
