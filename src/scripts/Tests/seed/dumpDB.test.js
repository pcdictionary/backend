import {dumpDB} from '../index.js'
import { PrismaClient } from "@prisma/client";
let prisma = new PrismaClient();

xdescribe('Dump script', ()=>{
    it("Executes succesfully", ()=>{
        return dumpDB(prisma)
        .finally(async () => {
            await prisma.$disconnect();
        })
    })
})