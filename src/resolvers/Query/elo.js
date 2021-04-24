const elo = {
    async getEloHistory(parent, args, { prisma }, info) {
        try {
          let query = {};
          console.log("WE ARE HIT")
    
          const foundElo = await prisma.elo.findUnique({
            where: {
              userId: args.data.id,
            },
            include:{
                eloHistory:{
                    where:{
                        GameType: args.data.GameType
                    }
                }
            }
          });
          console.log(foundElo)
          return foundElo;
        } catch (error) {
          return error;
        }
      },
};
  
  export default elo;
  