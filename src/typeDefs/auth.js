import gql from 'graphql-tag'

const typeDefs = gql`
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