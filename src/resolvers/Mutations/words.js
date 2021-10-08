import { wordIdCursor } from "../../index.js";
const words = {
  async createWord(parent, args, { prisma }, info) {
    try {
      const word = await prisma.word.create({
        data: {
          word: args.data.words,
          definitions: {
            create: {
              definition: args.data.definition,
              example: args.data.example,
              alternative: args.data.alternative,
            },
          },
        },
      });
      return word;
    } catch (error) {
      return error;
    }
  },
  async updateWord(parent, args, { prisma }, info) {
    try {
      console.log(args)
      const definition = await prisma.definitions.update({
        where: { id: args.id },
        data: {
          status: args.status,
        },
      });
      console.log(definition)
      return definition;
    } catch (error) {
      return error;
    }
  },
};

export default words;
