import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
    allUsers: [User!]!
    getUser: ReturnUser!
    getUserSummary(id: Int, userName: String): ReturnUser!
    getMatch(id: Int): Game!
    getAllMatches(data: GetAllMatchesInput): [Game]!
    getEloHistory(data: GetEloHistoryInput): Elo
    getParksData(locations: [String]): Location
  }
`;

export default typeDefs;
