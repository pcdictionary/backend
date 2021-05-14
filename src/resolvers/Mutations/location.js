import { locationStore } from "../../index.js";

export const location = {
  async setCheckin(parent, args, { verifiedUserId }, info) {
    try {
      console.log("mutation also hit");
      //create park
      const value = await locationStore.get(args.location);
      if (value == undefined) {
        // handle miss!
        console.log("value doesnt exist");
        await locationStore.set(
          args.location,
          { [verifiedUserId]: args.sport },
          3600
        );
      } else {
        console.log("value exists");
        value[verifiedUserId] = args.sport;
        await locationStore.set(args.location, value, 3600);
      }

      const test = await locationStore.set(verifiedUserId, args.location, 3600);
      return { values: "yolo" };
    } catch (error) {
      return error;
    }
  },
};
