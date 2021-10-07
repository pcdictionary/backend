const words = {
    async getWord(parent, args, { prisma }, info) {
      try {
          const wordDetails = await prisma.definitions.findUnique({
              where:{
                status: "PENDING"
              }
          })
          const word = await prisma.word.findUnique({
              where:{
                  id: wordDetails.wordId
              }
          })
        return {word, definition: wordDetails};
      } catch (error) {
        return error;
      }
    },
  
  };
  
  export default words;
  