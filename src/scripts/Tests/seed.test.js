import { PrismaClient } from "@prisma/client";
import {seed} from './index.js'
const prisma = new PrismaClient();

describe('Seed script', ()=>{
    it("Executes succesfully", ()=>{
        return seed(prisma, true).then(data =>{
            expect(data[0]).toEqual(100)
            expect(data[1]).toEqual(100)
        })
        .finally(async () => {
            await prisma.$disconnect();
        })
    })
})