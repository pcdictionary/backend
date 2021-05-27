import gql from "graphql-tag";
const typeDefs = gql`
  type Mutation {
    login(data: LoginUserInput): AuthPayload!
    createUser(data: CreateUserInput): AuthPayload!
    updateUser(data: UpdateUserInput): ReturnUser!
    verifyUser(code: String!): ReturnUser!
    newCode(phoneNumber: String!): ReturnUser!
    deleteUser: ReturnUser!
    setCheckin(location: String, sport: String): Location
  }
`;

export default typeDefs;
