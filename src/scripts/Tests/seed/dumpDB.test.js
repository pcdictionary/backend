/**
 * @jest-environment node
 */

import {dumpDB, flushPromises} from '../index.js'
import { PrismaClient } from "@prisma/client";
let prisma = new PrismaClient();

describe('Dump script', ()=>{
    afterAll(async()=>{
        await prisma.$disconnect();
    })
    it("Executes succesfully", async ()=>{
        await dumpDB(prisma)
    })
})