import bcrypt from "bcryptjs";
import generateAuthToken from "../../utils/generateAuthToken.js";
import hashPassword from "../../utils/hashPassword.js";

const user = {
  async createUser(parent, args, { prisma }, info) {
    try {
      const password = await hashPassword(args.data.password);
      const user = await prisma.user.create({
        data: {
          ...args.data,
          password,
          elo: { create: {} },
        },
      });
      return { user, token: generateAuthToken(user.id) };
    } catch (error) {
      return error;
    }
  },

  async login(parent, args, { prisma }, info) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: args.data.email,
        },
        include: {
          elo: true,
        },
      });

      if (!user) {
        throw new Error("Unable to login.");
      }
      const isMatch = await bcrypt.compare(args.data.password, user.password);
      if (!isMatch) {
        throw new Error("Unable to login.");
      }
      console.log(user, "THIS IS USER");
      return {
        user,
        token: generateAuthToken(user.id),
      };
    } catch (error) {
      return error;
    }
  },

  async updateUser(parent, args, { prisma, request, verifiedUserId }, info) {
    try {
      // const userId = getUserId(request);
      //const userId = verifiedUserId
      let newPassword = undefined;
      if (typeof args.data.password === "string") {
        newPassword = await hashPassword(args.data.password);
      }
      const updatedUser = await prisma.user.update(
        {
          where: {
            id: verifiedUserId,
          },
          data: { ...args.data, password: newPassword },
        },
        info
      );
      //console.log(updatedUser)
      return updatedUser;
    } catch (error) {
      return error;
    }
  },

  async deleteUser(parent, args, { prisma, request, verifiedUserId }, info) {
    try {
      if (verifiedUserId) {
        return new Error("Login in to delete Account!");
      }
      //console.log(789, deletedOwner)
      return await prisma.user.delete({ where: { id: verifiedUserId } });
    } catch (error) {
      return error;
    }
  },
};

export default user;
