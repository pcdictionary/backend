const typeDefs = `
    type AuthPayload {
        token: String!
        user: ReturnUser! 
    }
    input LoginUserInput {
        email: String!
        password: String!
    }
`

export default typeDefs