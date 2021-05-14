import { locationStore } from "../../index.js";
export const location = {
  async getParksData(parent, args, { verifiedUserId }, info) {
    try {
      console.log("THIS IS HIT", args.locations);
      const mykeys = await locationStore.keys();

      console.log(mykeys);
      const value = await locationStore.mget(args.locations);
      const strValue = JSON.stringify(value);
      console.log(strValue, "THIS IS TRVALUE");
      return { values: strValue };
    } catch (error) {
      return error;
    }
  },
};
