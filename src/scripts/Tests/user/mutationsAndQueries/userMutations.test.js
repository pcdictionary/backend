
import { userMutations } from './index.js'
import { seedData } from './index.js'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
xdescribe('User creation', ()=>{
    it("Creates user succesfully", async ()=>{
                console.log(123,seedData.userList[0])
        return userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
        .then(data=>{
            console.log(data.user.id)
        }).finally(async () => {
            await prisma.$disconnect();
        })
    })
})
