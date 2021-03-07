
export async function dumpDB(client) {
    await client.item.deleteMany();
    await client.owner.deleteMany();
    await client.user.deleteMany();
}