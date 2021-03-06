import getUserId from "../utils/getUserId.js";
import generateAuthToken from "../utils/generateAuthToken.js";
import hashPassword from "../utils/hashPassword.js";
import bcrypt from "bcryptjs";

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const password = await hashPassword(args.data.password);
    const user = prisma.user.create({
      data: {
        ...args.data,
        password,
      },
    });

    return { user, token: generateAuthToken(user.id) };
  },
  async login(parent, args, { prisma }, info) {
    const user = await prisma.user.findUnique({
      where: {
        email: args.data.email,
      },
    });

    if (!user) {
      throw new Error("Unable to login");
    }
    const isMatch = await bcrypt.compare(args.data.password, user.password);

    if (!isMatch) {
      throw new Error("Unable to login");
    }

    return {
      user,
      token: generateAuthToken(user.id),
    };
  },
  async updateUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    if (typeof args.data.password === "string") {
      args.data.password = await hashPassword(args.data.password);
    }

    return prisma.user.update(
      {
        where: {
          id: userId,
        },
        data: args.data,
      },
      info
    );
  },
  deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    if (!userId) {
      throw new Error("Login in to delete Account!");
    }
    return prisma.user.delete({ where: { id: userId } });
  },
  async createItem(parent, args, { prisma, request }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }

    const userId = 17;
    const owner = await prisma.owner.findUnique({
      where: {
        id: userId,
      },
    });
    return prisma.item.create({
      data: {
        ...args.data,
        Owner: {
          connect: {
            id: owner.id,
          },
        },
      },
      include: {
        Owner: true,
      },
    });
  },
};

export default Mutation;
