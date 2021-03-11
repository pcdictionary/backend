/**
 * @jest-environment node
 */
import { userMutations, userQueries, seedData, seed, dumpDB} from '../../index.js'
import { PrismaClient } from "@prisma/client";

let prisma

const dummyUserData = {'userName': 'Yugfap', 
'email': 'Ziwnemibufuuzcihwehyulevmautsadyacfubaviajwevqa@mail.org', 
'firstName': 'Qapmurgiscot', 
'lastName': 'Hewiyungilarzon', 
'password': 'NEYUqlafazareczogiytojagvuuysahisub118,'}

describe("Find User", ()=>{
    beforeAll(async ()=>{
        prisma = new PrismaClient();
        await dumpDB(prisma, "query")
        await seed(prisma, true, false, 'query')
    })
    afterAll(async()=>{
        await prisma.$disconnect()
        })
    it("Finds user by email", async ()=>{
        const data = await userQueries.getUser(undefined, {email:dummyUserData.email}, {prisma: prisma})
        expect(data.firstName).toEqual(dummyUserData.firstName)
    })
    it("Finds user by id", async ()=>{
        const data = await userQueries.getUser(undefined, {email:dummyUserData.email}, {prisma: prisma})
        expect(data.firstName).toEqual(dummyUserData.firstName)
    })
    it("Fails gracefully if incorrect parameters are passed", async ()=>{
        const data = await userQueries.getUser(undefined, {firstName:dummyUserData.firstName}, {prisma: prisma})
        expect(data.message).toEqual("Invalid search parameters")
        expect(data.message).not.toEqual("test")
    })
    it("Informs user if no results are found", async ()=>{
        const data = await userQueries.getUser(undefined, {email:"testemailthatsnotreal@fakeemailnode.fake"}, {prisma: prisma})
        expect(data.message).toEqual("No such user found.")
    })
})

describe("Find all Users", ()=>{
    beforeAll(()=>{
        prisma = new PrismaClient();
    })
    afterAll(async()=>{
        await dumpDB(prisma)
        await prisma.$disconnect()
        })
    it("Finds all users", ()=>{
        return userQueries.allUsers(undefined, undefined, {prisma: prisma})
        .then(data=>{
            expect(data.length).toEqual(10)
        })
        }
    )
    it("Returns an empty array if no users have been found", ()=>{
        return dumpDB(prisma)
        .then(()=>{
            return userQueries.allUsers(undefined, undefined, {prisma: prisma})
            .then(data=>{
                expect(data.length).toEqual(0)
            })
        })
    })
})

