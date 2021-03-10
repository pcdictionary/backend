/**
 * @jest-environment node
 */

import { PrismaClient } from "@prisma/client";
import {seed, dumpDB} from '../index.js'

let prisma = new PrismaClient();


describe('Seed script', ()=>{
    beforeEach(()=>{
        prisma = new PrismaClient();
    })
    afterAll(async ()=>{
        await dumpDB(prisma)
        await prisma.$disconnect();
    })
    it("Executes succesfully", async ()=>{
        const data = await seed(prisma, true)
        expect(data[0]).toEqual(10)
        expect(data[1]).toEqual(10)
        expect(data[2]).toEqual(100)
    
    })
    it("Returns an error when it fails", async ()=>{
        const data = await seed(prisma, true, true)
        expect(data.message.indexOf("Invalid `prisma.user.create()` invocation")).not.toEqual(-1)
    })
})