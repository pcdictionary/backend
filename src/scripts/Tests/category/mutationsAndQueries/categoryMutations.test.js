/**
 * @jest-environment node
 */
 import { userMutations, userQueries, seedData, seed, dumpDB, itemQueries, categoryMutations } from '../../index.js'
 import { PrismaClient } from "@prisma/client";

 let prisma
const invalidCats = [{id: 99}, {category: "Pies"}, {id: "1", category: "Test"},
{id: 88, category: 88}]

 describe('Category creation', ()=>{
    let userData
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