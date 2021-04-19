import gql from "graphql-tag";
const typeDefs = gql`
  enum GameType {
    Handball
    Basketball
    Soccer
    Tennis
    PingPong
  }
  enum VerificationStatus {
    PENDING
    STARTED
    COMPLETED
  }
`;

export default typeDefs;
