import { wordIdCursor } from "../../index.js";

const words = {
  async getWord(parent, args, { prisma }, info) {
    try {
      const cursor = await wordIdCursor.get("defCursor");
      console.log(cursor);
      if (!cursor) {
        const wordDetails = await prisma.definitions.findFirst({
          where: {
            status: "PENDING",
          },
        });
        const word = await prisma.word.findUnique({
          where: {
            id: wordDetails.wordId,
          },
          include: {
            alternatives: true,
          },
        });
        wordIdCursor.set("defCursor", wordDetails.id, 3600);
        return { word, definition: wordDetails };
      } else {
        const wordDetails = await prisma.definitions.findMany({
          take: 1,
          cursor: {
            id: cursor,
          },
          where: {
            status: "PENDING",
          },
          orderBy: {
            id: "asc",
          },
        });
        const word = await prisma.word.findUnique({
          where: {
            id: wordDetails[0].wordId,
          },
          include: {
            alternatives: true,
          },
        });
        wordIdCursor.set("defCursor", wordDetails[0].id, 3600);
        return { word, definition: wordDetails[0] };
      }
    } catch (error) {
      return "error";
    }
  },
  async skipWord(parent, args, { prisma }, info) {
    try {
      const cursor = await wordIdCursor.get("defCursor");
      const wordDetails = await prisma.definitions.findMany({
        take: 1,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          status: "PENDING",
        },
        orderBy: {
          id: "asc",
        },
      });
      const word = await prisma.word.findUnique({
        where: {
          id: wordDetails[0].wordId,
        },
        include: {
          alternatives: true,
        },
      });
      wordIdCursor.set("defCursor", wordDetails[0].id, 3600);
      return { word, definition: wordDetails[0] };
    } catch (error) {
      return "error";
    }
  },
};

export default words;
