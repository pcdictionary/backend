import getUserId from "../../utils/getUserId.js";
const user = {
  allUsers(parent, args, { prisma }, info) {
    return prisma.user.findMany();
  },
  getUser(parent, args, { prisma }, info) {
    console.log(parent, "this is parent");
    console.log(info, "this is info");
    return prisma.user.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};

export default user;
