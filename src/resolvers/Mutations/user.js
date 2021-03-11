import bcrypt from "bcryptjs";
import getUserId from "../../utils/getUserId.js"
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
          const userId = getUserId(request);
          let  newPassword = undefined
          if (typeof args.data.password === "string") {
            newPassword = await hashPassword(args.data.password);
          }
          const updatedUser = await prisma.user.update(
            {
              where: {
                id: userId,
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

      deleteUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request);
        if (!userId) {
          throw new Error("Login in to delete Account!");
        }
        return prisma.user.delete({ where: { id: userId } });
      },


}

export default user