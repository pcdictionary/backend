const elo = {
    async getEloHistory(parent, args, { prisma }, info) {
        try {
          let query = {};
    
          const foundElo = await prisma.elo.findUnique({
            where: {
              username: args.data.username,
            },
            include:{
                eloHistory:{
                    where:{
                        GameType: args.data.GameType
                    }
                }
            }
          });
          return foundElo;
        } catch (error) {
          return error;
        }
      },
};
  
  export default elo;
  