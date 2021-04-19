import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
    allUsers: [User!]!
    getUser(id: Int, email: String): ReturnUser!
  }
`;

export default typeDefs;
