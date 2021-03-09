import { seedData } from './seedDataDumps/seedData100.js'
import { dumpDB } from './dumpDBFunction.js'
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

export async function seed(client, test = false, testFailure=false) {
 const validUserIds = []
 const validOwnerIds = []
 const validItemIds = []
 if(testFailure){
     try {
        await client.user.create({data:{}})
     } catch (error) {
         return error
     }
 }
 for(let i = 0; i<seedData.userList.length; i++){
  try {
    let user = await client.user.create({data:seedData.userList[i]})  
    validUserIds.push(user.id)
   } catch (error) {
     console.log("Seed User Error on user:\n")
     console.log(seedData.userList[i])
     console.log(error)
     process.exit(1);
   } 
 }
 for(let i = 0; i<seedData.ownerList.length; i++){
     try {
         let userId = validUserIds[i]
         let owner = await client.owner.create({data:{userId: userId, ...seedData.ownerList[i]}})
         validOwnerIds.push(owner.id)
         
     } catch (error) {
        console.log("Seed Owner Error on entry:\n")
        console.log(seedData.ownerList[i])
        console.log(error)
        process.exit(1);
     }
 }
 for(let i = 0; i<seedData.itemList.length; i++){
   try {
     let ownerId = validOwnerIds[getRndInteger(0, validOwnerIds.length-1)]
     let item = await client.item.create({data:{ownerId: ownerId, ...seedData.itemList[i]}})
     validItemIds.push(item.id)
   } catch (error) {
    console.log("Seed Item Error on item:\n")
    console.log(seedData.itemList[i])
    console.log(error)
    process.exit(1);
   }
 }
   if(test) return [validUserIds.length, validItemIds.length]
}