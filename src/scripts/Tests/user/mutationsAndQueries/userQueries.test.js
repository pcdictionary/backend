/**
 * @jest-environment node
 */
import { userMutations, userQueries, seedData, seed, dumpDB, flushPromises} from '../../index.js'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dummyUserData = {
    'userName': 'Ejivjuggehomexmuas',
    'email': 'Weyazuycomunxoevanukodocvofmeoqwotagredidbeejumxefipzur@email.io',
    'firstName': 'Xagtoihsugjoikabyivdemalwenevagcud',
    'lastName': 'Jo',
    'password': 'QECCujhitojetzudersicosvapyikofsohukoj204!'
}

describe("Find User", ()=>{
    beforeAll(async ()=>{
        await dumpDB(prisma)
        await seed(prisma)
    })
    it("Finds user by email", ()=>{
        return userQueries.getUser(undefined, {email:dummyUserData.email}, {prisma: prisma})
        .then(data=>{
            expect(data.firstName).toEqual(dummyUserData.firstName)
        })
    })
    it("Finds user by id", ()=>{
        return userQueries.getUser(undefined, {email:dummyUserData.email}, {prisma: prisma})
        .then(data=>{
            expect(data.firstName).toEqual(dummyUserData.firstName)
        })
    })
    it("Fails gracefully if incorrect parameters are passed", ()=>{
        return userQueries.getUser(undefined, {firstName:dummyUserData.firstName}, {prisma: prisma})
        .then(data=>{
            expect(data.message).toEqual("Invalid search parameters")
            expect(data.message).not.toEqual("test")
        })
    })
    it("Informs user if no results are found", ()=>{
        return userQueries.getUser(undefined, {email:"testemailthatsnotreal@fakeemailnode.fake"}, {prisma: prisma})
        .then(data=>{
            expect(data.message).toEqual("No such user found.")
        })
    })
})

describe("Find all Users", ()=>{
    afterAll(async()=>{
        await dumpDB(prisma)
        await prisma.$disconnect()
        })
    it("Finds all users", ()=>{
        return userQueries.allUsers(undefined, undefined, {prisma: prisma})
        .then(data=>{
            expect(data.length).toEqual(100)
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