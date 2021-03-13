import bcrypt from "bcryptjs";
import generateAuthToken from "../../utils/generateAuthToken.js"
import hashPassword from "../../utils/hashPassword.js"

const user = {

    async createUser(parent, args, { prisma }, info) {
      try {
          const password = await hashPassword(args.data.password);
          const user = await prisma.user.create({
          data: {
              ...args.data,
              password,
            },
          });
          return { user, token: generateAuthToken(user.id) };
        } catch (error) {
          return error
        }
      },

      async login(parent, args, { prisma }, info) {
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: args.data.email,
            },
          });
      
          if (!user) {
            throw new Error("Unable to login.");
          }
          const isMatch = await bcrypt.compare(args.data.password, user.password);
          //console.log("Match", isMatch)
          if (!isMatch) {
            throw new Error("Unable to login.");
          }
          return {
            user,
            token: generateAuthToken(user.id),
          };
        } catch (error) {
          return error
        }
      },

      async updateUser(parent, args, { prisma, request }, info) {
        try {
         // const userId = getUserId(request);
          //const userId = request.verifiedUserId
          let  newPassword = undefined
          if (typeof args.data.password === "string") {
            newPassword = await hashPassword(args.data.password);
          }
          const updatedUser = await prisma.user.update(
            {
              where: {
                id: request.verifiedUserId
              },
              data: {...args.data, password:newPassword}
            },
            info
          );
          //console.log(updatedUser)
          return updatedUser
        } catch (error) {
          return error
        }
      },

      async deleteUser(parent, args, { prisma, request }, info) {
        //const userId = getUserId(request)
        try {
          if (!request.verifiedUserId) {
            return new Error("Login in to delete Account!");
          }
         // let deletedOwner
          const loggedInUser = await prisma.user.findUnique(
            {
              where:{id:request.verifiedUserId},
              include:{
                Owner: {
                  select: {
                    id: true,
                    User: true,
                  }
                }
              }
            }
            )
          console.log(102, loggedInUser)
          if(loggedInUser && loggedInUser.Owner!==null){
            await prisma.owner.delete({where: {userId: request.verifiedUserId}})
          }
          //console.log(789, deletedOwner)
          return await prisma.user.delete({ where: { id: request.verifiedUserId } });
        } catch (error) {
          return error
        }
      },


}

export default user