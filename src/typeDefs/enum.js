import gql from "graphql-tag";
const typeDefs = gql`
  enum GameType {
    HANDBALL
    BASKETBALL
    TENNIS
    PINGPONG
    AMERICANFOOTBALL
    FOOTBALL
    BASEBALL
    VOLLEYBALL
    BOXING
    CRICKET
    RUGBY
    WRESTLING
    HOCKEY
    BADMINTON
    DODGEBALL
    RACQUETBALL
    FENCING
    FRISBY
    LACROSSE
    SQUASH
    ARMWRESTLING
  }
  enum VerificationStatus {
    PENDING
    STARTED
    COMPLETED
  }
  enum AccountStatus {
    INCOMPLETE
    CONFIRMED
    BANNED
  }
`;

export default typeDefs;
