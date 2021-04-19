import gql from "graphql-tag";
const typeDefs = gql`
  enum GameType {
    HANDBALL
    BASKETBALL
    SOCCER
    TENNIS
    PINGPONG
  }
  enum VerificationStatus {
    PENDING
    STARTED
    COMPLETED
  }
`;

export default typeDefs;
