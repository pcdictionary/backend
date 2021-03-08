
export async function dumpDB(client) {
   // const tableArray = ['item', 'user', 'owner'] // this is for client.I.deleteMany()
    const tableArray = ['"Item"', '"User"', '"Owner"']//this is for queryRaw
    for(let i = 0; i<tableArray.length; i++){
        let done = await client.$queryRaw(`DELETE FROM ${tableArray[i]} CASCADE;`)
        //await client[tableArray[i]].deleteMany()
    }
}
