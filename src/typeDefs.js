const typeDefs = `type User {
  id: Int!
  email: String!
  firstName: String!
  lastName: String!
  password: String!
}
type Query {
  allUsers: [User!]!
  getUser(id: Int!): User! 
}
type Mutation {
  createUser(data: CreateUserInput) : User!
}
input CreateUserInput {
  firstName : String!
  lastName : String!
  email : String!
  password : String!
}
`;

export default typeDefs;
