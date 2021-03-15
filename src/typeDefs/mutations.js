import gql from "graphql-tag";
const typeDefs = gql`
  type Mutation {
    login(data: LoginUserInput): AuthPayload!
    createUser(data: CreateUserInput): AuthPayload!
    updateUser(data: UpdateUserInput): ReturnUser!
    deleteUser: ReturnUser!
    createOwner(data: CreateOwnerInput): Owner!
    updateOwner(data: UpdateOwnerInput): Owner!
    deleteOwner: Owner!
    createItem(data: CreateItemInput, categoryId: Int!): Item!
    updateItem(data: UpdateItemInput, categoryId: Int, itemId: Int!): Item!
    deleteItem(data: DeleteItemInput): Item!
    createCategory(data: CreateCategoryInput): Category!
    createSubcategory(data: CreateCategoryInput): Category!
    createTransaction(data: CreateTransactionInput, itemId: Int!): Transaction!
    createWishList: WishList!
    createLessee: Lessee!
    deleteTransaction(transactionId: Int!): Transaction!
    createChat(reciever: Int!): Chat!
    createMessage(data: CreateMessageInput): Chat!
    deleteChat(chatId: Int!): Chat!
    deleteMessage(messageId: Int!): Message!
    createItemReview(data: CreateItemReviewInput, itemId: Int!): ItemReview!
    updateItemReview(
      data: CreateItemReviewInput
      itemReviewId: Int!
    ): ItemReview!
    deleteItemReview(itemReviewId: Int!): ItemReview!
  }
`;

export default typeDefs;
