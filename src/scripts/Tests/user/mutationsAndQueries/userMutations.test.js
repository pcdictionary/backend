/**
 * @jest-environment node
 */
import { userMutations, userQueries, seedData, seed, dumpDB } from '../../index.js'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



const dummyUserData = {
    'userName': 'Ejivjuggehomexmuas',
    'email': 'Weyazuycomunxoevanukodocvofmeoqwotagredidbeejumxefipzur@email.io',
    'firstName': 'Xagtoihsugjoikabyivdemalwenevagcud',
    'lastName': 'Jo',
    'password': 'QECCujhitojetzudersicosvapyikofsohukoj204!'
    }
const incorrectPasswords = ["", "abcd"]


describe('User creation', ()=>{
    beforeAll(async ()=>{
        await dumpDB(prisma, "mutations start")
    })
    afterAll(async()=>{
        await dumpDB(prisma)
        await prisma.$disconnect()})
    it("Creates user succesfully and hashes password, and exists in the database", ()=>{
        return userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
        .then(data=>{
            expect(data.user.email).toEqual(seedData.userList[0].email)
            expect(data.user.password).not.toEqual(seedData.userList[0].password)
            return userQueries.getUser(undefined, {id:data.user.id}, {prisma: prisma})
            .then(data=>{
                expect(data.email).toEqual(seedData.userList[0].email)
            })
        })
    })
    it("Fails gracefully on incorrect parameters", ()=>{
        for(let i = 0; i<Object.keys(dummyUserData).length; i++){
            let currentKey = Object.keys(dummyUserData)[i]
            if(currentKey === "password") continue
            let testData = {...dummyUserData}
            delete testData[currentKey]
            return userMutations.createUser(undefined, {data:testData}, {prisma:prisma})
            .then(data=>{
            expect(data.message.indexOf("Invalid `prisma.user.create()` invocation")).not.toEqual(-1)
        })
        }
    })
    it("Fails gracefully on incorrect password", ()=>{
        for(let i = 0; i<incorrectPasswords.length; i++){
            let testData = {...dummyUserData}
            testData.password = incorrectPasswords[i]
            return userMutations.createUser(undefined, {data:testData}, {prisma:prisma})
            .then(data=>{
           expect(data.message.startsWith("Password must be")).toEqual(true)
        })
        }
    })
    it("Fails gracefully on no object(and no password key)", ()=>{
           return userMutations.createUser(undefined, {data:{}}, {prisma:prisma})
            .then(data=>{
            expect(data.message.startsWith("Password must be")).toEqual(true)
        })
    })
    // it("Cleans up", ()=>{
    //     return dumpDB(prisma, "mutations clean up")
    //     .finally(()=>{
    //         return prisma.$disconnect()
    //     })
    // })
})

    //login function returns token, user

    //updateUser updates
    //updateUser fails gracefully
    //updateUser updates updates password
    //updateUser fails password update gracefully
    //delete user deletes 
    //delete user fails gracefully
    //deleteUser 

    