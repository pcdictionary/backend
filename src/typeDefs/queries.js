import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
    allUsers: [User!]!
    getUser: ReturnUser!
    getWord: WordPayload!
    skipWord: WordPayload!
    searchWord(word: String): SearchedWordPayload!
    wordRecommendations(prefix: String): WordRecommendations!
    getHomePage: [WordPayload]
  }
`;

export default typeDefs;
