import gql from "graphql-tag";

const typeDefs = gql`
  input CreateUserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    admin: Boolean
  }
  input UpdateUserInput {
    firstName: String
    lastName: String
    email: String
    password: String
    admin: Boolean
  }
  type ReturnUser {
    id: Int!
    email: String!
    firstName: String!
    lastName: String!
    admin: Boolean
  }
  type User {
    id: Int!
    email: String!
    firstName: String!
    lastName: String!
    password: String!
    admin: Boolean
  }
`;

export default typeDefs;
