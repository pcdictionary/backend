
/**
 * @jest-environment node
 */

import { seedData } from './seedDataDumps/seedData100.js'
import hashPassword from "../../utils/hashPassword.js"
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

export async function seed(client, test = false, testFailure=false, source = "default") {
 const validUserIds = []
 const validOwnerIds = []
 const validItemIds = []
 const validCategoryIds = []

 if(testFailure){
     try {
        await client.user.create({data:{}})
     } catch (error) {
         return error
     }
 }
 let userLength = seedData.userList.length
 if(test) userLength = 10
 for(let i = 0; i<userLength; i++){
  try {
    seedData.userList[i].password = await hashPassword(seedData.userList[i].password)
    let user = await client.user.create({data:seedData.userList[i]})  
    validUserIds.push(user.id)
   } catch (error) {
     console.log("Seed User Error on user:\n")
     console.log(seedData.userList[i])
     console.log(error)
     process.exit(1);
   } 
 }
 let ownerLength = seedData.ownerList.length
 if(test) ownerLength = 10

 for(let i = 0; i<ownerLength; i++){
     let userId = validUserIds[i]
     try {
         let owner = await client.owner.create({data:{userId: userId, ...seedData.ownerList[i]}})
         validOwnerIds.push(owner.id)
     } catch (error) {
        console.log("Seed Owner Error on entry:\n")
        console.log(seedData.ownerList[i], userId, source)
        console.log(error)
        process.exit(1);
     }
 }

 for(let i = 0; i<seedData.categoryList.length; i++){
  try {
    let category = await client.category.create({data:{...seedData.categoryList[i]}})
    validCategoryIds.push(seedData.categoryList[i].id)
  } catch (error) {
    console.log("Seed Category Error on entry:\n")
    console.log(seedData.categoryList[i], source, "index: ", i)
    console.log(error)
    process.exit(1);
  }
 }

 for(let i = 0; i<seedData.itemList.length; i++){
   try {
     let ownerId = validOwnerIds[getRndInteger(0, validOwnerIds.length-1)]
     let categoryId = validCategoryIds[getRndInteger(0, validCategoryIds.length-1)]
     let item = await client.item.create({
      data: {
        ...seedData.itemList[i],
        Owner: {
          connect: {
            id: ownerId,
          },
        },
        Categories: {
          connect: [{ id: categoryId }],
        },
        }
      })
     validItemIds.push(item.id)
   } catch (error) {
    console.log("Seed Item Error on item:\n")
    console.log(seedData.itemList[i])
    console.log(error)
    process.exit(1);
   }
 }
   if(test) return [validUserIds.length, validOwnerIds.length, validItemIds.length, validCategoryIds.length]
}