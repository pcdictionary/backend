const elo = {
  async getEloHistory(parent, args, { prisma }, info) {
    try {
      let query = {};
      let foundElo
      if(args.data.datapoints === -1){
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
      }
      else{
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
      console.log("THIS IS HIT FOR TESTING", foundElo)
      return foundElo;
    } catch (error) {
      return error;
    }
  },
};

export default elo;
