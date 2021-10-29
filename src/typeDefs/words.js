import gql from "graphql-tag";

const typeDefs = gql`
  input CreateWordInput{
    words: String!
    definition: String!
    example: String!
    alternative: String!
  }
  type WordRecommendations{
    words: [String]
  }
  type WordPayload{
    word: Word
    definition: Definitions
  }
  type SearchedWordPayload{
    word: Word
    definition: Definitions
  }
  type Word {
    id: Int!
    word: String!
    definitions: [Definitions]
    alternatives: [Alternatives]
  }
  type Alternatives {
    id: Int!
    word: String!
  }
  type Definitions {
    id: Int!
    status: Status
    definition: String
    example: String
    alternative: [String]
  }
`;

export default typeDefs;
