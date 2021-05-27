import gql from "graphql-tag";

const typeDefs = gql`
  input CreateUserInput {
    firstName:  String!
    lastName:   String!
    email:      String!
    password:   String!
    userName:   String!
    phoneNumber: String!
  }
  input UpdateUserInput {
    firstName:  String
    lastName:   String
    email:      String
    password:   String
    userName:   String
    phoneNumber: String
  }
  type ReturnUser {
    id: Int!
    email: String!
    firstName:  String!
    lastName:   String!
    userName:   String!
    elo:        Elo
    phoneNumber:  String!
    status:     AccountStatus
    games:      [Game]
    games2:     [Game]
    allGames:   [Game]
  }
  type User {
    id:         Int!
    email:      String!
    firstName:  String!
    lastName:   String!
    password:   String!
    userName:   String!
    elo:        Elo
    games:      [Game]
    games2:     [Game]
  }
`;

export default typeDefs;
