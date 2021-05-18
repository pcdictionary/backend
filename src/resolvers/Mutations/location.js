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
          { [verifiedUserId]: args.sport, count: 1 },
          0
        );
      } else {
        console.log("value exists");
        value[verifiedUserId] = args.sport;
        value.count = value.count + 1
        await locationStore.set(args.location, value, 0);
      }

      const test = await locationStore.set(verifiedUserId, args.location, 3600);
      return { values: "yolo" };
    } catch (error) {
      return error;
    }
  },
};
