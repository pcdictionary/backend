import { userMutations, userQueries, seedData, seed, dumpDB, ownerMutations, ownerQueries } from '../../index.js'
import { PrismaClient } from "@prisma/client";

let prisma

describe("Find all Owners", ()=>{
    beforeAll(async ()=>{
        prisma = new PrismaClient();
        await dumpDB(prisma)
    })
    afterAll(async()=>{
        await dumpDB(prisma)
        await prisma.$disconnect()
    })
    it("Returns an empty array if no owners have been found", async()=>{
        const allOwnerArr = await ownerQueries.allOwners(undefined, undefined, {prisma:prisma})
        expect(allOwnerArr.length).toEqual(0)
    })
    it("Finds all owners", async()=>{
        await seed(prisma, true)
        const allOwnerArr = await ownerQueries.allOwners(undefined, undefined, {prisma:prisma})
        expect(allOwnerArr.length).toEqual(10)
    })
})

describe("Find Owner", ()=>{
    beforeAll(async ()=>{
        prisma = new PrismaClient();
        await dumpDB(prisma)
    })
    afterAll(async()=>{
        await dumpDB(prisma)
        await prisma.$disconnect()
    })
    it("Finds owner by id", async()=>{
        const createdUser = await prisma.user.create({data:seedData.userList[0]})
        const createdOwner = await prisma.owner.create({data:{userId:createdUser.id}})
        const foundOwner = await ownerQueries.getOwner(undefined, {ownerId: createdOwner.id}, {prisma:prisma})
        expect(foundOwner.id).toEqual(createdOwner.id)
        expect(foundOwner.userId).toEqual(createdUser.id)
    })
    it("Fails gracefully if incorrect parameters are passed", async ()=>{
        const foundOwner = await ownerQueries.getOwner(undefined, {}, {prisma:prisma})
        expect(foundOwner.message.indexOf("Invalid `prisma.owner.findUnique()` invocation")).not.toEqual(-1)
    })
    it("Informs user if no results are found", async()=>{
        const foundOwner = await ownerQueries.getOwner(undefined, {ownerId: 99999999999}, {prisma:prisma})
        expect(foundOwner.message).toEqual("No such user found.")
    })
})