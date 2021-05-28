import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
    allUsers: [User!]!
    getUser: ReturnUser!
    getUserSummary(id: Int, userName: String): ReturnUser!
    getMatch(id: Int): Game!
    getAllMatches(data: GetAllMatchesInput): [Game]!
    getAllMatchesPagination(data: GetAllMatchesPaginationInput): [Game]!
    getEloHistory(data: GetEloHistoryInput): Elo
    getParksData(locations: [String]): Location
    getMatchesCount: [Elo]!
  }
`;

export default typeDefs;
