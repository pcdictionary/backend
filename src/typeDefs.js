const typeDefs = `type User {
  id: Int!
  email: String!
  firstName: String!
  lastName: String!
  password: String!
  userName: String!
}
type Query {
  allUsers: [User!]!
  getUser(id: Int!): User! 
}
type Mutation {
  login(data: LoginUserInput): AuthPayload!
  createUser(data: CreateUserInput) : AuthPayload!
  updateUser(data: UpdateUserInput) : User!
  deleteUser: User!
  createItem(data: CreateItemInput) : Item!
}

type AuthPayload {
  token: String!
  user: User!
}

input LoginUserInput {
  email: String!
  password: String!
}

input CreateUserInput {
  firstName : String!
  lastName : String!
  email : String!
  password : String!
  userName: String!
}
input UpdateUserInput{
  firstName : String
  lastName : String
  email : String
  password : String
  userName: String
}
input CreateItemInput{
  itemName : String!
  price : Int!
  itemRating : Int
  totalRatingsCount : Int!
  ownerId: Int!

}
`;

export default typeDefs;
