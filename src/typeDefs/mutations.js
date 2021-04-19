import gql from "graphql-tag";
const typeDefs = gql`
  type Mutation {
    login(data: LoginUserInput): AuthPayload!
    createUser(data: CreateUserInput): AuthPayload!
    updateUser(data: UpdateUserInput): ReturnUser!
    deleteUser: ReturnUser!
  }
`;

export default typeDefs;
