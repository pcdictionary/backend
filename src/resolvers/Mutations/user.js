import bcrypt from "bcryptjs";
import generateAuthToken from "../../utils/generateAuthToken.js";
import hashPassword from "../../utils/hashPassword.js";
import { loginStore, updateUserStore } from "../../index.js";

const user = {
  async createUser(parent, args, { prisma, clientTwilio }, info) {
    try {
      let user;
      const password = await hashPassword(args.data.password);
      user = await prisma.user.create({
        data: {
          ...args.data,
          password,
          email: args.data.email.toLowerCase(),
        },
      });
      return user;
    } catch (error) {
      return error;
    }
  },
  async login(parent, args, { prisma }, info) {
    try {
      const value = await loginStore.get(args.data.email);
      if (value > 10) {
        throw new Error("Too Many Attempts");
      } else {
        if (value) {
          await loginStore.set(args.data.email, value + 1, 3600);
        } else {
          await loginStore.set(args.data.email, 1, 3600);
        }
      }

      const user = await prisma.user.findUnique({
        where: {
          email: args.data.email.toLowerCase(),
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

      return {
        user,
        token: generateAuthToken(user.id),
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async deleteUser(parent, args, { prisma, request, verifiedUserId }, info) {
    try {
      if (verifiedUserId) {
        return new Error("Login in to delete Account!");
      }
      return await prisma.user.delete({ where: { id: verifiedUserId } });
    } catch (error) {
      return error;
    }
  },
};

export default user;
