/**
 * @jest-environment node
 */
import { userMutations, userQueries, seedData, seed, dumpDB } from '../../index.js'
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


let prisma

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
        prisma = new PrismaClient();
        await dumpDB(prisma, "mutations start")
    })
    afterAll(async()=>{
        await prisma.$disconnect()
    })
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
})

describe("Login", ()=>{
    beforeAll(()=>{
        prisma = new PrismaClient();
    })
    let testUser = {...seedData.userList[0]}
    afterAll(async ()=>{
        await prisma.$disconnect()
    })
    it("Logs in user with correct credentials", async ()=>{
        const loggedIn = await userMutations.login(undefined, {data:testUser}, {prisma:prisma})
        expect(loggedIn.user).not.toBeNull()
        expect(loggedIn.user.firstName).toEqual(testUser.firstName)
        expect(loggedIn.token).not.toBeNull()
    })
    it("Fails gracefully on an incorrect password", async ()=>{
        testUser.password = ""
        const loggedIn = await userMutations.login(undefined, {data:testUser}, {prisma:prisma})
        expect(loggedIn.message).toEqual("Unable to login.")
    })
    it("Fails gracefully on an incorrect email", async ()=>{
        testUser = {...seedData.userList[0]}
        testUser.email = "a@a.a"
        const loggedIn = await userMutations.login(undefined, {data:testUser}, {prisma:prisma})
        expect(loggedIn.message).toEqual("Unable to login.")
    })
})


describe('User update', ()=>{
    let userData = seedData.userList[0]
    beforeAll(async ()=>{
        prisma = new PrismaClient();
        await dumpDB(prisma)
        userData = await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
    })
    afterAll(async()=>{
     //   await dumpDB(prisma)
       await prisma.$disconnect()
    })
    
    it("Updates user succesfully", async ()=>{
        
        const dummyKeys = Object.keys(dummyUserData)
        for(let i = 0; i<dummyKeys.length; i++){
            let tempUser = {...userData.user}
            if(dummyKeys[i]==="password") continue
            tempUser[dummyKeys[i]] = dummyUserData[dummyKeys[i]]
            // const updatedUser = await userMutations.updateUser(
            //     undefined, {data: tempUser}, {prisma:prisma, request:{headers:{cookie:"token="+userData.token}}})
            
            const updatedUser = await userMutations.updateUser(
                undefined, {data: tempUser}, {prisma:prisma, request:{verifiedUserId: userData.user.id}})
            expect(updatedUser[dummyKeys[i]]).toEqual(dummyUserData[dummyKeys[i]])
        }
    })
    let tempUser = {...userData.user}
    it("Updates password succesfully", async()=>{
        tempUser.password = "Abcdefghijklm4"
        // const updatedUser = await userMutations.updateUser(
        //     undefined, {data: {...tempUser}}, {prisma:prisma, request:{headers:{cookie:"token="+userData.token}}})
        const updatedUser = await userMutations.updateUser(
            undefined, {data: tempUser}, {prisma:prisma, request:{verifiedUserId: userData.user.id}})
        expect(await bcrypt.compare(tempUser.password, updatedUser.password)).toEqual(true)
    })
    it("Fails gracefully when password is invalid", async()=>{
        tempUser.password = "Ab"
        // const updatedUser = await userMutations.updateUser(
        //     undefined, {data: {...tempUser}}, {prisma:prisma, request:{headers:{cookie:"token="+userData.token}}})
        const updatedUser = await userMutations.updateUser(
            undefined, {data: tempUser}, {prisma:prisma, request:{verifiedUserId: userData.user.id}})
        expect(updatedUser.message).toEqual("Password must be 8 characters or longer")
    })
    //Due to login middleware these can no longer be checked at this level:
    // it("Fails gracefully on invalid token", async()=>{
    //     tempUser.password = "Abcdefghijklm4"
    //     const updatedUser = await userMutations.updateUser(
    //         undefined, {data: {...tempUser}}, {prisma:prisma, request:{headers:{cookie:"token=test12421412"}}})
    //     expect(updatedUser.message).toEqual("jwt malformed")
    // })
    // xit("Fails gracefully on fake token", async()=>{
    //     const updatedUser = await userMutations.updateUser(
    //         undefined, {data: {...tempUser}}, {prisma:prisma, request:{headers:{cookie:'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE5Mjg4LCJpYXQiOjE2MTU0MjE0OTd9.O1wHNB_OteykRIzGMYZTk6GkiGmG-vhLpyJUWklXi2I'}}})
    //     expect(updatedUser.meta.cause).toEqual('Record to update not found.')
    // })
    it("Updates partial values succesfully", async()=>{
        // const updatedUser = await userMutations.updateUser(
        //     undefined, {data: {email:"a@a.a"}}, {prisma:prisma, request:{headers:{cookie:"token="+userData.token}}})
        const updatedUser = await userMutations.updateUser(
            undefined, {data: {email:"a@a.a"}}, {prisma:prisma, request:{verifiedUserId: userData.user.id}})
        expect(updatedUser.email).toEqual("a@a.a")
    })
    it("Fails gracefully when an incorrect parameter is passed", async()=>{
        // const updatedUser = await userMutations.updateUser(
        //     undefined, {data: {test:"a@a.a"}}, {prisma:prisma, request:{headers:{cookie:"token="+userData.token}}})
        const updatedUser = await userMutations.updateUser(
            undefined, {data: {test:"a@a.a"}}, {prisma:prisma, request:{verifiedUserId: userData.user.id}})
        expect(updatedUser.message.indexOf("Invalid `prisma.user.update()` invocation:")).not.toEqual(-1)
    })
    it("Fails gracefully when userid isnt verified", async()=>{
        const updatedUser = await userMutations.updateUser(
            undefined, {data: {test:"a@a.a"}}, {prisma:prisma, request:{verifiedUserId: null}})
        expect(updatedUser.message.indexOf("Argument id for where.id must not be null. Please use undefined instead.")).not.toEqual(-1)
    })
})

describe('User deletion', ()=>{
    beforeAll(async ()=>{
        prisma = new PrismaClient();
        await dumpDB(prisma)
    })
    afterAll(async()=>{
       await dumpDB(prisma)
       await prisma.$disconnect()
    })
    it("Deletes user", async ()=>{
        let userData = await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
        const deletedUser = await userMutations.deleteUser(undefined, undefined, {prisma:prisma, request:{verifiedUserId:userData.user.id}})
        const checkUser = await userQueries.getUser(undefined, {email:deletedUser.email}, {prisma: prisma})
        expect(checkUser.message).toEqual("No such user found.")
    })
    it("Fails to delete when userid isnt verified", async ()=>{
        let userData = await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
        const deletedUser = await userMutations.deleteUser(undefined, undefined, {prisma:prisma, request:{verifiedUserId:null}})
        expect(deletedUser.message).toEqual("Login in to delete Account!")
        const checkUser = await userQueries.getUser(undefined, {email:seedData.userList[0].email}, {prisma: prisma})
        expect(checkUser.email).toEqual(seedData.userList[0].email)
    })
    it("Fails to delete when userId doesnt exist in DB", async ()=>{
        //let userData = await userMutations.createUser(undefined, {data:seedData.userList[0]}, {prisma:prisma})
        const deletedUser = await userMutations.deleteUser(undefined, undefined, {prisma:prisma, request:{verifiedUserId:999999999}})
        expect(deletedUser.meta.cause).toEqual("Record to delete does not exist.")
        const checkUser = await userQueries.getUser(undefined, {email:seedData.userList[0].email}, {prisma: prisma})
        expect(checkUser.email).toEqual(seedData.userList[0].email)
    })

})