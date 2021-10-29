import { wordIdCursor } from "../../index.js";
import { allWords, wordCount } from "../../index.js";
import { getRndInteger } from "../../utils/randomNumber.js";

const words = {
  async getWord(parent, args, { prisma }, info) {
    try {
      const cursor = await wordIdCursor.get("defCursor");
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
  async searchWord(parent, args, { prisma }, info) {
    const lowerCaseWord = args.word.toLowerCase();
    const data = await prisma.word.findUnique({
      where: {
        word: lowerCaseWord,
      },

      include: {
        alternatives: true,
        definitions: {
          where: {
            status: "APPROVED",
          },
        },
      },
    });
    return data;
  },
  async wordRecommendations(parent, args, { prisma }, info) {
    if (args.prefix !== "") {
      const data = await allWords.get("allWords");
      return { words: data.find(args.prefix) };
    } else {
      return { words: [] };
    }
  },
  async getHomePage(parent, args, { prisma }, info) {
    const words = await prisma.word.findMany({
      take: 5,
      include: {
        alternatives: true,
        definitions: {
          where: {
            status: "APPROVED",
          },
        },
      },
    });

    return words;
  },
  async wordPagination(parent, args, { prisma }, info) {
    const words = await prisma.word.findMany({
      skip: args.page,
      take: 10,
      where: {
        word: {
          startsWith: args.letter,
        },
      },

      orderBy: {
        word: "asc",
      },
      include: {
        alternatives: true,
        definitions: {
          where: {
            status: "APPROVED",
          },
        },
      },
    });
    return words;
  },
  async totalWordCount(parent, args, { prisma }, info){
    const data = await allWords.get("allWords");
    const totalCount = data.find(args.letter)
    return totalCount.length
  }
};

export default words;
