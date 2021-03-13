/**
 * @jest-environment node
 */
 import { userMutations, userQueries, seedData, seed, dumpDB, ownerMutations } from '../../index.js'
 import { PrismaClient } from "@prisma/client";
 
 let prisma
 
 
 describe('User creation', ()=>{
     let userData
     beforeAll(async ()=>{
         prisma = new PrismaClient();
         await dumpDB(prisma)
         userData =  await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
     })
     afterAll(async()=>{
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
        const deletedUser = await userMutations.deleteUser(undefined, undefined, {prisma:prisma, request:{verifiedUserId:userData.user.id}})
        console.log(123, deletedUser)
        userData =  await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
        console.log(456, userData)
        const createdOwner = await ownerMutations.createOwner(undefined, {data:{
            rating: 3.55,
            totalRatingCount: 317
        }}, 
            {prisma:prisma, request:{verifiedUserId: userData.user.id}})
       expect(createdOwner.userId).toEqual(userData.user.id)
       expect(createdOwner.rating).toEqual(3.55)
       expect(createdOwner.totalRatingCount).toEqual(317)
     })
     xit("Fails gracefully to create an owner if there is no user attached", ()=>{

     })
 })
 
 