import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
    allUsers: [User!]!
    getUser(id: Int, email: String): ReturnUser!
    allOwners: [Owner!]!
    getOwner(userId: Int!): Owner!
    allUserItems: [Item]!
    getItem(id: Int!): Item!
    getCategories: [Category]!
    allChats: [Chat!]!
  }
`;

export default typeDefs;
