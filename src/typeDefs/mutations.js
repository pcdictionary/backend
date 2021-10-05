import gql from "graphql-tag";
const typeDefs = gql`
  type Mutation {
    login(data: LoginUserInput): AuthPayload!
    createUser(data: CreateUserInput): User!
    deleteUser: ReturnUser!
  }
`;

export default typeDefs;
