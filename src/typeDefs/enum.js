import gql from "graphql-tag";
const typeDefs = gql`
  enum Status {
    PENDING
    APPROVED
    DENIED
  }
`;

export default typeDefs;