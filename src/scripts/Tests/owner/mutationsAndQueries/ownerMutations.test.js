/**
 * @jest-environment node
 */
 import { userMutations, userQueries, seedData, seed, dumpDB, ownerMutations } from '../../index.js'
 import { PrismaClient } from "@prisma/client";
 
 let prisma
 
 const incorrectOwnerValues= [{status: 25},{rating: "test"},{totalRatingCount: "test"}, {totalRatingCount: 25.5},
{rating: -1}, {totalRatingCount: -1}, {totalRatingCount: 0, rating: 1}]
 const correctOwnerValues = [{status: "Active"}, {rating: 5}, {totalRatingCount: 99}, {rating: 4.5}]
 describe('Owner creation', ()=>{
     let userData
     beforeAll(async ()=>{
         prisma = new PrismaClient();
         await dumpDB(prisma)
         userData =  await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
     })
     beforeEach(async ()=>{
        await userMutations.deleteUser(undefined, undefined, {prisma:prisma, request:{verifiedUserId:userData.user.id}})
        userData =  await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
     })  
     afterAll(async()=>{
        await dumpDB(prisma)
        await prisma.$disconnect()
     })
     it("Can create an owner with correct default values", async ()=>{
        const createdOwner = await ownerMutations.createOwner(undefined, {data:{}}, 
            {prisma:prisma, request:{verifiedUserId: userData.user.id}})
       expect(createdOwner.userId).toEqual(userData.user.id)
       expect(createdOwner.rating).toEqual(0)
       expect(createdOwner.totalRatingCount).toEqual(0)
       expect(createdOwner.status).toEqual('Inactive')
     })
     it("Can create an owner with custom values", async ()=>{
        const createdOwner = await ownerMutations.createOwner(undefined, {data:{
            rating: 3.55,
            totalRatingCount: 317
        }}, 
            {prisma:prisma, request:{verifiedUserId: userData.user.id}})
       expect(createdOwner.userId).toEqual(userData.user.id)
       expect(createdOwner.rating).toEqual(3.55)
       expect(createdOwner.totalRatingCount).toEqual(317)
     })
     it("Fails gracefully to create an owner if there is no user attached", async ()=>{
        const createdOwner = await ownerMutations.createOwner(undefined, {data:{
            rating: 3.55,
            totalRatingCount: 317
        }}, 
            {prisma:prisma, request:{verifiedUserId: null}})
        expect(createdOwner.message.indexOf("Argument userId for where.userId must not be null. Please use undefined instead.")).not.toEqual(-1)
     })
     it("Fails gracefully if there is already an owner", async ()=>{
        const createdOwner = await ownerMutations.createOwner(undefined, {data:{
            rating: 3.55,
            totalRatingCount: 317
        }}, 
            {prisma:prisma, request:{verifiedUserId: userData.user.id}})
        const createdDuplicate = await ownerMutations.createOwner(undefined, {data:{
            rating: 3.56,
            totalRatingCount: 318
        }}, 
            {prisma:prisma, request:{verifiedUserId: userData.user.id}})
      expect(createdDuplicate.message).toEqual("User already has an Owner account attached.")
     })
     it("Fails gracefully if user not found", async()=>{
        const createdOwner = await ownerMutations.createOwner(undefined, {data:{
            rating: 3.55,
            totalRatingCount: 317
        }}, 
            {prisma:prisma, request:{verifiedUserId: 99999999999}})
        expect(createdOwner.message.indexOf("Foreign key constraint failed on the field")).not.toEqual(-1)
     })
     it("Fails gracefully if the data entered is incorrect", async()=>{
         for(let i = 0; i<incorrectOwnerValues.length; i++){
            let tempOwner = incorrectOwnerValues[i]
            const createdOwner = await ownerMutations.createOwner(undefined, {data:tempOwner},
                {prisma:prisma, request:{verifiedUserId: userData.user.id}})
            expect(createdOwner.message.indexOf("Got invalid value")).not.toEqual(-1)
        }
    })

 })
 
 describe('Owner update', ()=>{
    let userData
    let createdOwner
    beforeAll(async ()=>{
        prisma = new PrismaClient();
        await dumpDB(prisma)
        userData =  await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
    })
    beforeEach(async()=>{
        await userMutations.deleteUser(undefined, undefined, {prisma:prisma, request:{verifiedUserId:userData.user.id}})
        userData =  await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
        createdOwner = await ownerMutations.createOwner(undefined, {data:{
            rating: 3.55,
            totalRatingCount: 317
        }}, 
            {prisma:prisma, request:{verifiedUserId: userData.user.id}})
    })
    afterAll(async()=>{
        await dumpDB(prisma)
        await prisma.$disconnect()
    })
    it("Updates user succesully by userid", async ()=>{
        for(let i = 0; i<correctOwnerValues.length; i++){
            let updatedOwner = await ownerMutations.updateOwner(undefined, {data:correctOwnerValues[i]}, 
                {prisma:prisma, request:{verifiedUserId: userData.user.id}})
            let objectKey = Object.keys(correctOwnerValues)[0]
            expect(updatedOwner[objectKey]).toEqual(correctOwnerValues[i][objectKey])
        }
    })
    it("Updates user succesully by ownerid", async ()=>{
        for(let i = 0; i<correctOwnerValues.length; i++){
            let updatedOwner = await ownerMutations.updateOwner(undefined, {data:correctOwnerValues[i]}, 
                {prisma:prisma, request:{verifiedUserId: userData.user.id, verifiedOwnerId: createdOwner.id}})
            let objectKey = Object.keys(correctOwnerValues[i])[0]
            expect(updatedOwner[objectKey]).toEqual(correctOwnerValues[i][objectKey])
        }
    })
    it("Fails to update when incorrect data is provided", async ()=>{
        for(let i = 0; i<incorrectOwnerValues.length; i++){
            let updatedOwner = await ownerMutations.updateOwner(undefined, {data:incorrectOwnerValues[i]}, 
                {prisma:prisma, request:{verifiedUserId: userData.user.id, verifiedOwnerId: createdOwner.id}})
            expect(updatedOwner.message.indexOf("Got invalid value")).not.toEqual(-1)
            updatedOwner = await prisma.owner.findUnique({where:{id:createdOwner.id }})
            let objectKey = Object.keys(incorrectOwnerValues[i])[0]
            expect(updatedOwner[objectKey]).not.toEqual(incorrectOwnerValues[i][objectKey])
        }
    })
    it("Fails to update if no user id is provided", async()=>{
        const updatedOwner = await ownerMutations.updateOwner(undefined, {data:{rating: 3}}, 
            {prisma:prisma, request:{verifiedOwnerId: createdOwner.id}})

        expect(updatedOwner.message).toEqual("Please login!")
    })
    it("Fails to update if owner does not exist in the db", async()=>{
        const updatedOwner = await ownerMutations.updateOwner(undefined, {data:{rating: 3}}, 
            {prisma:prisma, request:{verifiedUserId: userData.user.id, verifiedOwnerId: 999999999}})
        expect(updatedOwner.meta.cause).toEqual("Record to update not found.")
    })
    xit("Fails to update if the user does not exist in the db", async()=>{
        //not sure if this redundancy is needed
    })
})

describe("Owner delete", ()=>{
    let userData
    let createdOwner
    beforeAll(async ()=>{
        prisma = new PrismaClient();
        await dumpDB(prisma)
        userData =  await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
    })
    beforeEach(async()=>{
        await userMutations.deleteUser(undefined, undefined, {prisma:prisma, request:{verifiedUserId:userData.user.id}})
        userData =  await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
        createdOwner = await ownerMutations.createOwner(undefined, {data:{
            rating: 3.55,
            totalRatingCount: 317
        }}, 
            {prisma:prisma, request:{verifiedUserId: userData.user.id}})
    })
    afterAll(async()=>{
        await dumpDB(prisma)
        await prisma.$disconnect()
    })
    it("Deletes owner", async()=>{
        await ownerMutations.deleteOwner(undefined, undefined, {prisma:prisma, request:{verifiedUserId:userData.user.id}})
        const deletedOwner = await prisma.owner.findUnique({where:{userId:userData.user.id}})
        expect(deletedOwner).toBeNull()
    })
    it("Fails to delete when userid isnt provided", async()=>{
        const deletedOwner = await ownerMutations.deleteOwner(undefined, undefined, {prisma:prisma, request:{}})
        expect(deletedOwner.message).toEqual("Please login!")
    })
    it("Fails gracefully when ownerId doesnt exist in DB", async()=>{
        const deletedOwner =  await ownerMutations.deleteOwner(undefined, undefined, 
            {prisma:prisma, request:{verifiedUserId:userData.user.id, verifiedOwnerId: 99999999999}})
        expect(deletedOwner.meta.cause).toEqual("Record to delete does not exist.")
    })
})