import { wordIdCursor } from "../../index.js";
const words = {
  async createWord(parent, args, { prisma }, info) {
    try {
      const alternatives = args.data.alternative.split(",");
      const alternativesData = [];
      for (let x = 0; x < alternatives.length; x++) {
        alternativesData.push({
          where: { word: alternatives[x] },
          create: { word: alternatives[x] },
        });
      }
      const foundWord = await prisma.word.findUnique({
        where: {
          word: args.data.words,
        },
        include: {
          definitions: true,
          alternatives: true,
        },
      });
      console.log(foundWord);
      if (foundWord) {
        const word = await prisma.word.update({
          where: {
            id: foundWord.id,
          },
          data: {
            definitions: {
              create: {
                definition: args.data.definition,
                example: args.data.example,
              },
            },
            alternatives: { connectOrCreate: alternativesData },
          },
        });
        return word;
      } else {
        const word = await prisma.word.create({
          data: {
            word: args.data.words,
            definitions: {
              create: {
                definition: args.data.definition,
                example: args.data.example,
                // alternative: args.data.alternative,
              },
            },
            alternatives: { connectOrCreate: alternativesData },
          },
        });
        return word;
      }
    } catch (error) {
      return error;
    }
  },
  async updateWord(parent, args, { prisma }, info) {
    try {
      console.log(args);
      const definition = await prisma.definitions.update({
        where: { id: args.id },
        data: {
          status: args.status,
        },
      });
      console.log(definition);
      return definition;
    } catch (error) {
      return error;
    }
  },
};

export default words;
