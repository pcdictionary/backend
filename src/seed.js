import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  // await prisma.itemCategory.deleteMany();
  await prisma.item.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  const user1 = await prisma.user.create({
    data: {
      email: "phurba@email.com",
      firstName: "phurba",
      lastName: "sherpa",
      userName: "phrbshrp",
      password: "abc123",
      Owner: { create: { rating: 3.6, totalRatingCount: 1 } },
    },
  });

  const item = await prisma.item.create({
    data: {
      ownerId: user1.id,
      itemName: "JBL Speakers",
      price: 24.5,
      itemRating: 3.5,
      totalRatingCount: 10,
      description: "high quality speakers, long lasting battery",
    },
    include: {
      Categories: true,
    },
  });

  const category = await prisma.category.create({
    data: {
      category: "tools",
      Items: {
        connect: [{ id: item.id }],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "don@email.com",
      firstName: "don",
      lastName: "ng",
      userName: "itizidon",
      password: "abc123",
      Owner: {
        create: {
          rating: 3.0,
          totalRatingCount: 1,
        },
      },
    },
  });

  // const lessee = await prisma.lessee.create({
  //   data: {
  //     lesseeId: user2.id,
  //     rating: 3.5,
  //     totalRatingCount: 1,
  //   },
  // });

  // const itemReview = await prisma.itemReview.create({
  //   data: {
  //     itemId: item.id,
  //     lesseeId: lessee.lesseeId,
  //     rating: 3.0,
  //     comment: "This item works extremly well",
  //   },
  // });

  // const transaction = await prisma.transaction.create({
  //   data: {
  //     lesseeId: lessee.lesseeId,
  //     ownerId: owner.ownerId,
  //     itemId: item.id,
  //     startDate: "3/3/2021",
  //     endDate: "3/5/2021",
  //     salePrice: 24.5,
  //     status: "COMPLETED",
  //   },
  // });

  // const productOwnerReview = await prisma.productOwnerReview.create({
  //   data: {
  //     lesseeId: lessee.lesseeId,
  //     productOwnerId: owner.ownerId,
  //     rating: 3.4,
  //     comment: "The owner was on time and made the process smooth.",
  //   },
  // });

  // const lesseeReview = await prisma.lesseeReview.create({
  //   data: {
  //     lesseeId: lessee.lesseeId,
  //     productOwnerId: owner.ownerId,
  //     rating: 3.4,
  //     comment:
  //       "The renter was on time and respected my stuff. Would reccommend lending to them.",
  //   },
  // });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
