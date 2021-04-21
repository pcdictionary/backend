const user = {
  async allUsers(parent, args, { prisma }, info) {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      return error 
    }
  },
  
  async getUser(parent, args, { prisma }, info) {
    try {
      let query = {}
      if(args.id) query = {id:args.id}
      else if(args.email) query = {email:args.email}
      else return new Error("Invalid search parameters")
      const foundUser = await prisma.user.findUnique({
        where: {
          ...query
        },
      })
      return foundUser ? foundUser : new Error("No such user found.")
    } catch (error) {
      return error
    }
  },
  async getUserSummary(parent, args, { prisma }, info) {
    try {
      let query = {}
      if(args.id) query = {id:args.id}
      else if(args.userName) query = {userName:args.userName}
      else return new Error("Invalid search parameters")
      const foundUser = await prisma.user.findUnique({
        where: {
          ...query
        },
        include:{
          allGames: {
            take:3,
            orderBy:{
              id: "desc"
            },
          }
        },
      })
      return foundUser ? foundUser : new Error("No such user found.")
    } catch (error) {
      return error
    }
  }
};

export default user;
