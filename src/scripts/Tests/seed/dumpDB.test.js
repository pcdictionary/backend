/**
 * @jest-environment node
 */

import {dumpDB, flushPromises} from '../index.js'
import { PrismaClient } from "@prisma/client";
let prisma = new PrismaClient();

describe('Dump script', ()=>{
    it("Executes succesfully", ()=>{
        return dumpDB(prisma)
        .finally(async () => {
            await prisma.$disconnect();
        })
    })
})