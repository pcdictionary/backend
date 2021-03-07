import { userMutations } from './index.js'
import { seedData } from './index.js'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

describe('User creation', ()=>{
    it("Creates user succesfully", ()=>{
                console.log(123,seedData.userList[0])
        return userMutations.createUser(null, {data:seedData.userList[0]}, {prisma:prisma}, null)
        .then(data=>{
            console.log(data.user)
        })
    })
})