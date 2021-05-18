import gql from "graphql-tag";

const typeDefs = gql`
  input GetAllMatchesInput {
    username: String!
    GameType: GameType!
  }
  type Game {
    status: VerificationStatus
    GameType: GameType
    score1: Int
    score2: Int
    users: [User]
    users2: [User]
  }
`;

export default typeDefs;
