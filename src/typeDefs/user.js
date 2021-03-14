const typeDefs = `
    input CreateUserInput {
        firstName: String!
        lastName: String!
        email: String!
        password: String!
        userName: String!
    }
    input UpdateUserInput{
        firstName: String
        lastName: String
        email: String
        password: String
        userName: String
    }
    type ReturnUser {
        id: Int!
        email: String!
        firstName: String!
        lastName: String!
        userName: String!
        owner: Owner
        lessee: Lessee
        Message: [Message!]!
        VerificationTable: [VerificationTable!]!
        Question: [Question!]!
        QuestionVotes: [QuestionVotes!]!
        ReplyVotes: [ReplyVotes!]!
        OwnerMessages: [Chat]
        RequestMessages: [Chat]
      }
    type User {
        id: Int!
        email: String!
        firstName: String!
        lastName: String!
        password: String!
        userName: String!
        owner: Owner
        lessee: Lessee
        Message: [Message!]!
        VerificationTable: [VerificationTable!]!
        Question: [Question!]!
        QuestionVotes: [QuestionVotes!]!
        ReplyVotes: [ReplyVotes!]!
        OwnerMessages: [Chat]
        RequestMessages: [Chat]
    }
`

export default typeDefs