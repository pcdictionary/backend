import gql from "graphql-tag";
const typeDefs = gql`
  type Mutation {
    login(data: LoginUserInput): AuthPayload!
    createUser(data: CreateUserInput): AuthPayload!
    updateUser(data: UpdateUserInput, code: String!): ReturnUser!
    verifyUser(code: String!, phoneNumber: String!): ReturnUser!
    newCode(phoneNumber: String!): ReturnUser!
    deleteUser: ReturnUser!
    changePhoneNumber(phoneNumber: String!): ReturnUser!
    setCheckin(location: String, sport: String): Location
    allowChanges(phoneNumber: String!): ReturnUser!
  }
`;

export default typeDefs;
