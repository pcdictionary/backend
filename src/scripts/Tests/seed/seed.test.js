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
    it("Executes succesfully", ()=>{
        return seed(prisma, true).then(data =>{
            expect(data[0]).toEqual(100)
            expect(data[1]).toEqual(100)
        })
        .finally(async () => {
            await prisma.$disconnect();
        })
    })
    it("Returns an error when it fails", ()=>{
        return seed(prisma, true, true).then(data =>{
            expect(data.message.indexOf("Invalid `prisma.user.create()` invocation")).not.toEqual(-1)
        })
        .finally(async () => {
            await prisma.$disconnect();
        })
    })

})