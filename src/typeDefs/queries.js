import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
    allUsers: [User!]!
    getUser: ReturnUser!
    getWord: WordPayload!
    skipWord: WordPayload!
  }
`;

export default typeDefs;
