const typeDefs = `type Query {
  allUsers: [User!]!
  getUser(id: Int!): User! 
  allUserItems: (id: Int!): [Item]!
  getItem:(id: Int!): Item!
  getCategories: [Category]!
}
type Mutation {
  login(data: LoginUserInput): AuthPayload!
  createUser(data: CreateUserInput) : AuthPayload!
  updateUser(data: UpdateUserInput) : User!
  deleteUser: User!
  createItem(data: CreateItemInput) : Item!
  updateItem(data: UpdateItemInput) : Item!
  deleteItem(data: DeleteItemInput) : Item!
  createCategory(data: CreateItemCategoryInput) : ItemCategory
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
  price : Int!
  itemRating : Int
  totalRatingCount : Int!
}
input UpdateItemInput{
  itemName: String
  description: String
  price: Int
  id: Int!
}
input DeleteItemInput{
  id: Int!
}
input CreateItemCategoryInput{
  itemId: Int!
  categoryId: Int!
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
  message: [Message!]!
  verificationTable: [VerificationTable!]!
  question: [Question!]!
  questionVotes: [QuestionVotes!]!
  replyVotes: [ReplyVotes!]!
  ownerMessages: [Chat]
  requestMessages: [Chat]
}
type Lessee{
  lesseeId: User!
  rating: Float!
  totalRatingCount: Int!
  cart: [Cart!]!
  itemReview: [ItemReview!]!
  lesseeReview: [LesseeReview!]!
  paypalLessee: [PaypalLessee]!
  prodcutOwnerReview: [ProductOwnerReview!]!
  stripeLessee: [StripeLessee!]!
}
type Owner{
  id: User!
  rating: Float!
  totalRatingCount: Int!
  Items: [Item!]!
  lesseeReview: [LesseeReview!]!
  paypalOwner: [PaypalOwner]!
  prodcutOwnerReview: [ProductOwnerReview!]!
  stripeOwner: [StripeOwner!]!
  transactions: [Transaction!]!
}
type Item{
  id: Int!
  itemName: String!
  price: Float!
  itemRating: Float
  totalRatingCount: Int
  description: String!
  ownerId: Int!
  itemCategory: [ItemCategory!]!
  itemReview: [ItemReview!]!
  transactions: [Transaction!]!
  question: [Question!]
  Owner: Owner!
}
type Category {
  id: Int!
  category: String!
  ItemCategoryId: [ItemCategory!]!
  parentCategoryId: [SubCategory!]!
  subCategoryId: [SubCategory!]!
}
type SubCategory{
  id: Int!
  parentCategoryId: Category!
  subCategoryId: Category!
}
type ItemCategory{
  id: Int!
  itemId: Item!
  categoryId: Category!
}
type Question{
  id: Int!
  itemId: Item!
  userId: User!
  question: String!
  likes: Int!
  dislikes: Int!
  reply: [Reply!]!
  questionVotes: [QuestionVotes!]!
}
type Reply {
  id: Int!
  questionId: Question!
  likes: Int!
  dislikes: Int!
  reply: String!
  replyVotes: [ReplyVotes!]!
}
type QuestionVotes{
  id: Int!
  userId: User!
  questionId: Question!
  vote: Int!
}
type ReplyVotes{
  id: Int!
  userId: User!
  replyId: Reply!
  vote: Int!
}
type ItemReview {
  id: Int!
  rating: Float!
  comment: String!
  itemId: Item!
  lesseeId: Lessee!
}
type Transaction{
  id: Int!
  status: TransactionStatus!
  startDate: String!
  endDate: String!
  salePrice: Float!
  ownerId: Owner!
  itemId: Item!
  cartId: Cart!
}
type Cart{
  id: Int!
  lesseeId: Lessee!
  paymentMethod: String!
  totalPrice: Float!
  transaction: [Transaction!]!
  status: CartStatus!
}
type VerificationTable{
  id: Int!
  verified: VerificationStatus!
  verificationDataId: VerificationData!
  userId: User!
}
type VerificationData{
  id: Int!
  userIdImageUrl: String!
  verificationTable: [VerificationTable!]!
}
type ProductOwnerReview{
  id: Int!
  rating: Float!
  comment: String!
  lessseId: Lessee!
  productOwnerId: Owner!
}
type LesseeReview {
  id: Int!
  rating: Float!
  comment: String!
  lesseeId: Lessee!
  productOwnerId: Owner!
}
type Paypal{
  id: Int!
  paypalToken: String!
  paypalLessee: [PaypalLessee!]!
  paypalOwner: [PaypalOwner!]!
}
type PaypalOwner{
  id: Int!
  verified: VerificationStatus!
  paypalId: Paypal!
  ownerId: Owner! 
}
type PaypalLessee{
  id: Int!
  verified: VerificationStatus!
  paypalId: Paypal!
  lesseeId: Lessee! 
}
type Stripe{
  id: Int!
  stripeToken: String!
  stripeLessee: [StripeLessee!]!
  stripeOwner: [StripeOwner!]!
}
type StripeOwner{
  id: Int!
  verified: VerificationStatus!
  stripeId: Stripe!
  ownerId: Owner! 
}
type StripeLessee{
  id: Int!
  verified: VerificationStatus!
  stripeId: Stripe!
  lesseeId: Lessee! 
}
type Message{
  id: Int!
  message: String!
  chatId: Chat!
  userId: User!
}
type Chat{
  id: Int!
  user1Id: User!
  user2Id: User!
  messageCount: Int!
  message: [Message!]!
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
enum CartStatus {
  ACTIVE
  COMPLETED
}


`;

export default typeDefs;
