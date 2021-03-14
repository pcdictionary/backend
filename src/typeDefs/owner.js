const typeDefs = `
    type Owner{
        id: Int!
        User: User!
        userId: Int!
        rating: Float!
        totalRatingCount: Int!
        Items: [Item!]!
        LesseeReview: [LesseeReview!]!
        PaypalOwner: [PaypalOwner]!
        ProdcutOwnerReview: [ProductOwnerReview!]!
        StripeOwner: [StripeOwner!]!
        Transactions: [Transaction!]!
    }
    input CreateOwnerInput{
        userId: Int
        rating: Float
        totalRatingCount: Int
    }
    input UpdateOwnerInput{
        rating: Float
        totalRatingCount: Int
    }
`

export default typeDefs