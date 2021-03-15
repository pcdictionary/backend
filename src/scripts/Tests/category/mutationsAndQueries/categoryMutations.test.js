/**
 * @jest-environment node
 */
 import { userMutations, userQueries, seedData, seed, dumpDB, itemQueries, categoryMutations } from '../../index.js'
 import { PrismaClient } from "@prisma/client";

 let prisma
const invalidCats = [{id: 99}, {category: "Pies"}, {id: "1", category: "Test"},
{id: 88, category: 88}]

 describe('Category creation', ()=>{
    beforeAll(async ()=>{
        prisma = new PrismaClient();
        await dumpDB(prisma)
    })
    beforeEach(async ()=>{

    })  
    afterAll(async()=>{
       await dumpDB(prisma)
       await prisma.$disconnect()
    })
    it("Creates a category", async()=>{
        const newCategory = await categoryMutations.createCategory(undefined,
            {data:seedData.categoryList[0]}, {prisma: prisma, request:{isAdmin: true}})
        expect(newCategory).not.toBeNull()
        expect(typeof newCategory.category).toEqual('string')
    })
    it("Creates a category that has parent category", async()=>{
        const newCategory = await categoryMutations.createCategory(undefined,
            {data:{parentCategoryId: 0, ...seedData.categoryList[1]}}, {prisma: prisma, request:{isAdmin: true}})
        expect(newCategory).not.toBeNull()
        expect(typeof newCategory.category).toEqual('string')
        const parentCat = await prisma.category.findUnique(
            {where: {id:0},include:{subCategory: true}}
            )
        expect(newCategory.category).toEqual(parentCat.subCategory[0].category)
    })
    it("Fails gracefully when unauthorized user tried to create a category", async()=>{
        const newCategory = await categoryMutations.createCategory(undefined,
            {data:seedData.categoryList[2]}, {prisma: prisma, request:{isAdmin: false}})
        expect(newCategory.message).toEqual("Insufficient rights")
    })
    it("Fails gracefully when required paraments are missing or invalid", async ()=>{
        for(let i = 0; i<invalidCats.length; i++){
            let newCategory = await categoryMutations.createCategory(undefined,
                {data:invalidCats[i]}, {prisma: prisma, request:{isAdmin: true}})
            expect(newCategory.message.indexOf("Invalid `prisma.category.create()` invocation")).not.toEqual(-1)
        }
    })
    it("Fails gracefully to create a duplicate category", async()=>{
        const newCategory = await categoryMutations.createCategory(undefined,
            {data:seedData.categoryList[0]}, {prisma: prisma, request:{isAdmin: true}})
        expect(newCategory.message.indexOf("Invalid `prisma.category.create()` invocation")).not.toEqual(-1)
    })
    it("Fails gracefully to create a category that is a subcategory of itself", async()=>{
        const newCategory = await categoryMutations.createCategory(undefined,
            {data:{parentCategoryId: 3, ...seedData.categoryList[3]}}, {prisma: prisma, request:{isAdmin: true}})
        expect(newCategory.message).toEqual("Invalid parent category")
        })
 })

 describe('Category update', ()=>{
    let parentCategory
    let childCategory
    beforeAll(async ()=>{
        prisma = new PrismaClient();
        await dumpDB(prisma)
        parentCategory = await categoryMutations.createCategory(undefined,
            {data:seedData.categoryList[0]}, {prisma: prisma, request:{isAdmin: true}})
        childCategory = await categoryMutations.createCategory(undefined,
            {data:{parentCategoryId: 0, ...seedData.categoryList[1]}}, {prisma: prisma, request:{isAdmin: true}})
    })
    beforeEach(async ()=>{

    })  
    afterAll(async()=>{
       await dumpDB(prisma)
       await prisma.$disconnect()
    })
    it("Updates a category", async()=>{
        const updatedCategory = await categoryMutations.updateCategory(undefined, 
            {catId: parentCategory.id, data: seedData.categoryList[2]}, {prisma: prisma, request:{isAdmin: true}})
        expect(updatedCategory.category).toEqual(seedData.categoryList[2].category)
    })
    it("Updates category's approval status", async()=>{
        const updatedCategory = await categoryMutations.updateCategory(undefined, 
            {catId: parentCategory.id, data:{approved:false}}, {prisma: prisma, request:{isAdmin: true}})
        expect(updatedCategory.approved).toEqual(false)
    })
    it("Ignores undefined approval status", async()=>{
        const updatedCategory = await categoryMutations.updateCategory(undefined, 
            {catId: parentCategory.id, data:{approved:undefined}}, {prisma: prisma, request:{isAdmin: true}})
        expect(updatedCategory.approved).toEqual(false)
    })
    it("Ignores undefined category name", async()=>{
        const updatedCategory = await categoryMutations.updateCategory(undefined, 
            {catId: parentCategory.id, data:{category:undefined}}, {prisma: prisma, request:{isAdmin: true}})
        expect(updatedCategory.category).toEqual("Beauty")
    })
    it("Fails gracefully when user doesnt have enough permissions", async()=>{
        const updatedCategory = await categoryMutations.updateCategory(undefined, 
            {catId: parentCategory.id, data:{category:"Test"}}, {prisma: prisma, request:{isAdmin: false}})
        expect(updatedCategory.message).toEqual("Insufficient rights")
    })
    it("Updates parent category id", async ()=>{
        const updatedCategory = await categoryMutations.updateCategory(undefined, 
            {catId: parentCategory.id, data: {parentCategoryId: 1}}, {prisma: prisma, request:{isAdmin: true}})
        expect(updatedCategory.parentCategoryId).toEqual(1)
    })
    it("Ignores undefined parent category id", async ()=>{
        const updatedCategory = await categoryMutations.updateCategory(undefined, 
            {catId: parentCategory.id, data: {parentCategoryId: undefined}}, {prisma: prisma, request:{isAdmin: true}})
        expect(updatedCategory.parentCategoryId).toEqual(1)
    })
    it("Fails gracefully when parent category doesnt exist", async ()=>{
        const updatedCategory = await categoryMutations.updateCategory(undefined, 
            {catId: parentCategory.id, data: {parentCategoryId: 999999999}}, {prisma: prisma, request:{isAdmin: true}})
        expect(updatedCategory.message.indexOf("Invalid `prisma.category.update()` invocation")).not.toEqual(-1)
    })
    it("Fails gracefully when target category doesnt exist", async ()=>{
        const updatedCategory = await categoryMutations.updateCategory(undefined, 
            {catId: 99999999999, data: {parentCategoryId: 0}}, {prisma: prisma, request:{isAdmin: true}})
        expect(updatedCategory.meta.cause).toEqual('Record to update not found.')
    })
    it("Fails gracefully when parent category points to itself", async ()=>{
        const updatedCategory = await categoryMutations.updateCategory(undefined, 
            {catId: 0, data: {parentCategoryId: 0}}, {prisma: prisma, request:{isAdmin: true}})
        expect(updatedCategory.message).toEqual("Invalid parent category")
    })
    it("Fails gracefully on incorrect inputs", async ()=>{
        for(let i = 0; i<invalidCats.length; i++){
            let updatedCategory = await categoryMutations.updateCategory(undefined,
                {data:invalidCats[i]}, {prisma: prisma, request:{isAdmin: true}})
            expect(updatedCategory.message.indexOf("Invalid `prisma.category.update()` invocation")).not.toEqual(-1)
        }
    })
 })

 describe('Category delete', ()=>{
    let parentCategory
    let childCategory
    beforeAll(async ()=>{
        prisma = new PrismaClient();
        await dumpDB(prisma)
    })
    beforeEach(async ()=>{
        parentCategory = await categoryMutations.createCategory(undefined,
            {data:seedData.categoryList[0]}, {prisma: prisma, request:{isAdmin: true}})
        childCategory = await categoryMutations.createCategory(undefined,
            {data:{parentCategoryId: 0, ...seedData.categoryList[1]}}, {prisma: prisma, request:{isAdmin: true}})
    })  
    afterAll(async()=>{
       await dumpDB(prisma)
       await prisma.$disconnect()
    })
    it("Deletes succesfully", async()=>{
        const deletedCategory = await categoryMutations.deleteCategory(undefined,
            {catId: 0}, {prisma: prisma, request:{isAdmin: true}})
        expect(deletedCategory.id).toEqual(0)
        const notFound = await prisma.category.findUnique({where:{id:0}})
        expect(notFound).toBeNull()
    })
    it("Fails gracefully when user doesnt have enough permissions", async()=>{
        const deletedCategory = await categoryMutations.deleteCategory(undefined, 
            {catId: parentCategory.id}, {prisma: prisma, request:{isAdmin: false}})
        expect(deletedCategory.message).toEqual("Insufficient rights")
    })
    it("Fails gracefully when user doesnt have enough permissions", async()=>{
        const deletedCategory = await categoryMutations.deleteCategory(undefined, 
            {catId: 99999999}, {prisma: prisma, request:{isAdmin: true}})
        expect(deletedCategory.meta.cause).toEqual('Record to delete does not exist.')
    })
    it("Appropriately removes parent references after deletion", async()=>{
        const deletedCategory = await categoryMutations.deleteCategory(undefined,
            {catId: 0}, {prisma: prisma, request:{isAdmin: true}})
        const childOfDeleted = await prisma.category.findUnique({where:{id:1}})
        expect(childOfDeleted.parentCategoryId).toBeNull()
    })
    it("Appropriately removes child references after deletion,", async()=>{
        const deletedCategory = await categoryMutations.deleteCategory(undefined,
            {catId: 1}, {prisma: prisma, request:{isAdmin: true}})
        const parentOfDeleted = await prisma.category.findUnique({where:{id:0}, include:{subCategory:true}})
        expect(parentOfDeleted.subCategory.length).toEqual(0)
    })
})