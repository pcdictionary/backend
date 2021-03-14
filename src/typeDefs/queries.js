const typeDefs = `
    type Query {
        allUsers: [User!]!
        allOwners: [Owner!]!
        getUser(id: Int, email: String): ReturnUser!
        allUserItems: [Item]!
        getItem(id: Int!): Item!
        getCategories: [Category]!
        getOwner(userId: Int!): Owner!
    }
`

export default typeDefs