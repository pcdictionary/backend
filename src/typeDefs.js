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
  createItemCategory(data: CreateItemCategoryInput) : ItemCategory!
  createCategory(data: CreateCategoryInput) : Category!
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
input CreateCategory{
  category: String!
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
  rating: Float!
  totalRatingCount: Int!
  Cart: [Cart!]!
  ItemReview: [ItemReview!]!
  LesseeReview: [LesseeReview!]!
  PaypalLessee: [PaypalLessee]!
  ProdcutOwnerReview: [ProductOwnerReview!]!
  StripeLessee: [StripeLessee!]!
}
type Owner{
  id: Int!
  User: User!
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
  ItemCategory: [ItemCategory!]!
  ItemReview: [ItemReview!]!
  Transactions: [Transaction!]!
  Question: [Question!]
}
type Category {
  id: Int!
  category: String!
  itemCategoryId: Int!
  parentCategoryId: Int!
  subCategoryId: Int! 
  ItemCategory: [ItemCategory!]!
  ParentCategory: [SubCategory!]!
  SubCategory: [SubCategory!]!
}
type SubCategory{
  id: Int!
  parentCategoryId: Int!
  subCategoryId: Int! 
  ParentCategory: Category!
  SubCategory: Category!
}
type ItemCategory{
  id: Int!
  itemId: Int!
  Item: Item!
  categoryId: Int!
  Category: Category!
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
  ownerId: Int!
  Owner: Owner!
  itemId: Int!
  Item: Item!
  cartId: Int!
  Cart: Cart!
}
type Cart{
  id: Int!
  lesseeId: Int!
  Lessee: Lessee!
  paymentMethod: String!
  totalPrice: Float!
  Transaction: [Transaction!]!
  status: CartStatus!
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
enum CartStatus {
  ACTIVE
  COMPLETED
}


`;

export default typeDefs;
