const Mutation = {
  createUser(parent, args, { prisma }, info) {
    console.log(user, "fdwfwfbibiwefbbwe");
    return prisma.mutation.createUser(
      {
        data: {
          ...args.data,
        },
      },
      info
    );
  },
};

export default Mutation;
