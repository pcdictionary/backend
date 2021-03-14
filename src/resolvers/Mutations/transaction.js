import getUserId from "../../utils/getUserId.js";

const transaction = {
  async createTransaction(parent, args, { prisma }, info) {
    // const userId = getUserId(request);
    // if (!userId) {
    //   throw new Error("Login in to delete Account!");
    // }
<<<<<<< HEAD
    const userId = 6;

    // const cart = await prisma.cart.findUnique({
    //   where: {
    //     activecart: {
    //       lesseeId: userId,
    //       status: "ACTIVE",
    //     },
    //   },
    // });

    // console.log(cart);
=======
    const userId = 2;

    const owner = await prisma.owner.findUnique({
      where: {
        userId: userId,
      },
    });
    const lessee = await prisma.lessee.findUnique({
      where: {
        userId: userId,
      },
    });

    console.log(lessee)
>>>>>>> 0e11dc9ec29a04432e7bae7083f5af678d89510b

    return prisma.transaction.create({
      data: {
        ...args.data,
<<<<<<< HEAD
        Cart: {
          connectOrCreate: {
            where: { lesseeId: userId, status: "ACTIVE" },
            create: {
              paymentMethod: args.paymentMethod,
              totalPrice: args.totalPrice,
              status: "ACTIVE",
              lessee: {
                connectOrCreate: {
                  where: { id: userId },
                  create: {
                    rating: 0,
                    totalRatingCount: 0,
                    User: {
                      connect: {
                        id: userId,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Owner: {
          connect: {
            id: args.ownerId,
=======
        Owner: {
          connect: {
            id: owner.id
>>>>>>> 0e11dc9ec29a04432e7bae7083f5af678d89510b
          },
        },
        Item: {
          connect: {
            id: args.itemId,
          },
        },
<<<<<<< HEAD
      },
    });

    // const cart = await prisma.cart.upsert({
    //   where: {
    //     id: userId,
    //   },
    //   select: {
    //     status: "ACTIVE",
    //   },
    //   create: {
    //     lessee: {
    //       connectOrCreate: {
    //         where: {
    //           id: userId,
    //         },
    //         create: {
    //           totalRatingCount: 2,
    //           rating: 3,
    //         },
    //       },
    //     },
    //     status: "ACTIVE",
    //     paymentMethod: args.paymentMethod,
    //     totalPrice: args.totalPrice,
    // },
    //   update:{

    //   }
    // });
    // console.log(cart, "THIS IS CARRRRRT");

    // const transaction = await prisma.transaction.create({
    //     data:{
    //         ...args.data,
    //         Cart: {
    //             connect:{
    //                 id: cart.id
    //             }
    //         },
    //         Item: {
    //             connect: {
    //                 id: args.itemId
    //             }
    //         },
    //         Owner: {
    //             connect: {
    //                 id: args.ownerId
    //             }
    //         }
    //     }
    // })
    // console.log(transaction,"this is transaction")
    // return transaction
  },
=======
        Lessee:{
          connect: {
            id: lessee.id
          }
        }
      },
      include: {
        Owner: true,
        Lessee: true
      },
    });
  },
  deleteTransaction(parent, args, { prisma }, info){
    return prisma.transaction.delete({ where: { id: args.transactionId } });
  }
>>>>>>> 0e11dc9ec29a04432e7bae7083f5af678d89510b
};
export default transaction;
