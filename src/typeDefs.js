const typeDefs = `type Query {
  allUsers: [User!]!
  getUser(id: Int, email: String): ReturnUser!
  allUserItems: [Item]!
  getItem(id: Int!): Item!
  getCategories: [Category]!
  getOwner(userId: Int!): Owner!
}
type Mutation {
  login(data: LoginUserInput): AuthPayload!
  createUser(data: CreateUserInput) : AuthPayload!
  updateUser(data: UpdateUserInput) : ReturnUser!
  deleteUser: ReturnUser!
  createItem(data: CreateItemInput, categoryId: Int!) : Item!
  updateItem(data: UpdateItemInput, categoryId: Int, itemId: Int!) : Item!
  deleteItem(data: DeleteItemInput) : Item!
  createCategory(data: CreateCategoryInput) : Category!
  createSubcategory(data: CreateCategoryInput) : Category!
  createTransaction(data: CreateTransactionInput, itemId: Int!) : Transaction!
  createWishList: WishList!
  createLessee: Lessee!
  deleteTransaction(transactionId: Int!) : Transaction!
  createItemReview(data: CreateItemReviewInput, itemId: Int!): ItemReview!
  updateItemReview(data: CreateItemReviewInput, itemReviewId: Int!): ItemReview!
}
type AuthPayload {
  token: String!
  user: ReturnUser! 
}
input LoginUserInput {
  email: String!
  password: String!
}

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
input CreateItemInput{
  itemName : String!
  description: String!
  price : Float!
  itemRating : Float
  totalRatingCount : Int!
}
input UpdateItemInput{
  itemName: String
  description: String
  price: Int

  totalRatingCount : Int!
}
input DeleteItemInput{
  id: Int!
}
input CreateCategoryInput{
  category: String!
  parentCategoryId: Int
}
input CreateTransactionInput{
  status: TransactionStatus
  salePrice: Float!
  startDate: String
  endDate: String
  paymentMethod: String!
}
input CreateItemReviewInput{
  rating: Int!
  comment: String!
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
type Lessee{
  id: Int!
  User: User!
  userId: Int!
  rating: Float!
  totalRatingCount: Int!
  ItemReview: [ItemReview!]!
  LesseeReview: [LesseeReview!]!
  PaypalLessee: [PaypalLessee]!
  ProdcutOwnerReview: [ProductOwnerReview!]!
  StripeLessee: [StripeLessee!]!
  Transactions: [Transaction!]!
}
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
type Item{
  id: Int!
  itemName: String!
  price: Float!
  itemRating: Float
  totalRatingCount: Int
  description: String!
  ownerId: Int!
  Owner: Owner!
  Categories: [Category!]!
  ItemReview: [ItemReview!]!
  Transactions: [Transaction!]!
  Question: [Question!]
  WishlistItems: [WishListItems!]
}
type Category {
  id: Int!
  category: String
  subCategory: [Category!]
  parentCategoryId: Int
  parentCategory: Category
}

type Question{
  id: Int!
  itemId: Int!
  userId: Int!
  Item: Item!
  User: User!
  question: String!
  likes: Int!
  dislikes: Int!
  Reply: [Reply!]!
  QuestionVotes: [QuestionVotes!]!
}
type Reply {
  id: Int!
  questionId: Int!
  Question: Question!
  likes: Int!
  dislikes: Int!
  reply: String!
  ReplyVotes: [ReplyVotes!]!
}
type QuestionVotes{
  id: Int!
  vote: Int!
  userId: Int!
  User: User!
  questionId: Int!
  Question: Question!
}
type ReplyVotes{
  id: Int!
  vote: Int!
  userId: Int!
  User: User!
  replyId: Int!
  Reply: Reply!
}
type ItemReview {
  id: Int!
  rating: Float!
  comment: String!
  itemId: Int!
  Itme: Item!
  lesseeId: Int!
  Lessee: Lessee!
}
type Transaction{
  id: Int!
  status: TransactionStatus!
  startDate: String!
  endDate: String!
  salePrice: Float!
  paymentMethod: String
  ownerId: Int!
  Owner: Owner!
  itemId: Int!
  lesseeId: Int!
  Item: Item!
  Lessee: Lessee!
}
type WishList{
  id: Int!
  userId: Int!
  User: User!
  paymentMethod: String!
  totalPrice: Float!
  WishListItems: [WishListItems!]!
}
type WishListItems{
  id: Int!
  wishListId: Int!
  itemId: Int!
  WishList: WishList!
  Item: Item!
}
type VerificationTable{
  id: Int!
  verified: VerificationStatus!
  verificationDataId: Int!
  VerificationData: VerificationData!
  userId: Int!
  User: User!
}
type VerificationData{
  id: Int!
  userIdImageUrl: String!
  VerificationTable: [VerificationTable!]!
}
type ProductOwnerReview{
  id: Int!
  rating: Float!
  comment: String!
  lessseId: Int!
  Lessee: Lessee!
  productOwnerId: Int!
  productOwner: Owner!
}
type LesseeReview {
  id: Int!
  rating: Float!
  comment: String!
  lesseeId: Int!
  Lessee: Lessee!
  productOwnerId: Int!
  productOwner: Owner!

}
type Paypal{
  id: Int!
  paypalToken: String!
  PaypalLessee: [PaypalLessee!]!
  PaypalOwner: [PaypalOwner!]!
}
type PaypalOwner{
  id: Int!
  verified: VerificationStatus!
  paypalId: Int!
  Paypal: Paypal!
  ownerId: Int!
  Owner: Owner!
}
type PaypalLessee{
  id: Int!
  verified: VerificationStatus!
  paypalId: Int!
  Paypal: Paypal!
  lesseeId: Int!
  Lessee: Lessee!
}
type Stripe{
  id: Int!
  stripeToken: String!
  StripeLessee: [StripeLessee!]!
  StripeOwner: [StripeOwner!]!
}
type StripeOwner{
  id: Int!
  verified: VerificationStatus!
  stripeId: Int!
  Stripe: Stripe!
  ownerId: Int!
  Owner: Owner! 
}
type StripeLessee{
  id: Int!
  verified: VerificationStatus!
  stripeId: Int!
  Stripe: Stripe!
  lesseeId: Int!
  Lessee: Lessee!
}
type Message{
  id: Int!
  message: String!
  chatId: Int!
  Chat: Chat!
  userId: Int!
  User: User!
}
type Chat{
  id: Int!
  user1Id: Int!
  User1: User!
  user2Id: Int!
  User2: User!
  messageCount: Int!
  Message: [Message!]!
}
enum VerificationStatus {
  PENDING
  VERIFIED
  UNVERIFIED
}
enum TransactionStatus {
  PENDING
  APPROVED
  REJECTED
  ACTIVE
  COMPLETED
}


`;

export default typeDefs;
