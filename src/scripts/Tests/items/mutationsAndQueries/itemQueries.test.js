/**
 * @jest-environment node
 */
 import { userMutations, userQueries, seedData, seed, dumpDB, itemQueries } from '../../index.js'
 import { PrismaClient } from "@prisma/client";

 let prisma


 describe('Item creation', ()=>{
    beforeAll(async ()=>{
        prisma = new PrismaClient();
        await dumpDB(prisma)
        await seed(prisma, true, false)
    })
    afterAll(async()=>{
        await prisma.$disconnect()
    })
    it("Gets all items succesfully", async ()=>{
        return true
    })
 })
 