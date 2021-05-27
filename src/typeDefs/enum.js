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
  enum AccountStatus{
    INCOMPLETE
    CONFIRMED
    BANNED
  }
`;

export default typeDefs;
