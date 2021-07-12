/**
 * @jest-environment node
 */
export async function dumpDB(client) {
   // const tableArray = ['item', 'user', 'owner'] // this is for client.I.deleteMany()
    const tableArray = ['"Game"']//this is for queryRaw
    let done
    for(let i = 0; i<tableArray.length; i++){
        done = await client.$queryRaw(`DELETE FROM ${tableArray[i]} CASCADE;`)
        //await client[tableArray[i]].deleteMany()
    }
    return done
}
