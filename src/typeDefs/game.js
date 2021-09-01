import gql from "graphql-tag";

const typeDefs = gql`
  input GetAllMatchesInput {
    username: String!
    GameType: GameType!
  }
  input GetAllMatchesPaginationInput{
    username: String!
    GameType: GameType!
    page: Int!
  }
  type Game {
    id: Int!
    status: VerificationStatus
    GameType: GameType
    score1: Int
    score2: Int
    users: [User]
    users2: [User]
    note: String!
    createdAt: String
    endedAt: String
  }
  type AccountMatchesType{
    Elo: Elo
    ReturnUser: ReturnUser
  }
`;

export default typeDefs;
