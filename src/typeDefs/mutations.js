import gql from "graphql-tag";
const typeDefs = gql`
  type Mutation {
    login(data: LoginUserInput): AuthPayload!
    createUser(data: CreateUserInput): User!
    deleteUser: ReturnUser!
    createWord(data: CreateWordInput): Word
    updateWord(status: String, id: Int): Definitions
  }
`;

export default typeDefs;
