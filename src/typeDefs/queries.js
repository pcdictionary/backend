import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
    allUsers: [User!]!
    getUser: ReturnUser!
    getWord: WordPayload!
  }
`;

export default typeDefs;
