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
    phoneNumber:  String!
  }
  type User {
    id:         Int!
    email:      String!
    firstName:  String!
    lastName:   String!
    password:   String!
    userName:   String!
    phoneNumber: String
  }
`;

export default typeDefs;
