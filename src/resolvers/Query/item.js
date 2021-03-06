import getUserId from "../../utils/getUserId.js";
const item = {
    allUserItems(parent, args, {prisma}, info){
        return prisma.item.findMany({
            where:{
                id: args.id
            }
        })
    },
    getItem(parent, args, {prisma}, info){
        return prisma.item.findUnique({
            where:{
                id: args.id
            }
        })
    },
};
export default item;
