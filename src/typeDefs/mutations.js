const typeDefs = `  
    type Mutation {
        login(data: LoginUserInput): AuthPayload!
        createUser(data: CreateUserInput) : AuthPayload!
        updateUser(data: UpdateUserInput) : ReturnUser!
        deleteUser: ReturnUser!
        createOwner(data: CreateOwnerInput) : Owner!
        updateOwner(data: UpdateOwnerInput) : Owner!
        deleteOwner: Owner!
        createItem(data: CreateItemInput, categoryId: Int!) : Item!
        updateItem(data: UpdateItemInput, categoryId: Int, itemId: Int!) : Item!
        deleteItem(data: DeleteItemInput) : Item!
        createCategory(data: CreateCategoryInput) : Category!
        createSubcategory(data: CreateCategoryInput) : Category!
        createTransaction(data: CreateTransactionInput, itemId: Int!) : Transaction!
        createWishList: WishList!
        createLessee: Lessee!
        deleteTransaction(transactionId: Int!) : Transaction!
    }
    `

export default typeDefs;