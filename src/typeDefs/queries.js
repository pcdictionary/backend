import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
    allUsers: [User!]!
    getUser: ReturnUser!
    getWord: WordPayload!
    skipWord: WordPayload!
    searchWord(word: String): Word
    wordRecommendations(prefix: String): WordRecommendations!
    getHomePage: [Word]
    wordPagination(page: Int, letter: String): [Word]
    totalWordCount(letter: String): Int
  }
`;

export default typeDefs;
