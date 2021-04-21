import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
    allUsers: [User!]!
    getUser(id: Int, email: String): ReturnUser!
    getUserSummary(id: Int, userName: String): ReturnUser!
    getMatch(id: Int): Game!
    getAllMatches(data: GetAllMatchesInput): [Game]!
  }
`;

export default typeDefs;
