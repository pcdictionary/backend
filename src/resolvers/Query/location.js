import { locationStore } from "../../index.js";
export const location = {
  async getParksData(parent, args, { verifiedUserId }, info) {
    try {
      // const mykeys = await locationStore.keys();
      const value = await locationStore.mget(args.locations);
      const strValue = JSON.stringify(value);
      return { values: strValue };
    } catch (error) {
      return error;
    }
  },
};
