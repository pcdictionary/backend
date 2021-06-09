import { locationStore } from "../../index.js";

export const location = {
  async setCheckin(parent, args, { verifiedUserId }, info) {
    try {
      //create park
      const value = await locationStore.get(args.location);
      const otherUserLocation = await locationStore.get(verifiedUserId);
      if (!otherUserLocation) {
        if (value == undefined) {
          // handle miss!
          await locationStore.set(
            args.location,
            { [verifiedUserId]: args.sport, count: 1 },
            0
          );
        } else {
          if (value[verifiedUserId]) {
            value[verifiedUserId] = args.sport;
            await locationStore.set(args.location, value, 0);
          } else {
            value[verifiedUserId] = args.sport;
            value.count = value.count + 1;
            await locationStore.set(args.location, value, 0);
          }
        }
      } else {
        const oldLocation = await locationStore.get(otherUserLocation);
        oldLocation.count = oldLocation.count - 1;
        delete oldLocation[userId];
        locationStore.set(otherUserLocation, oldLocation, 0);

        if (value == undefined) {
          // handle miss!
          await locationStore.set(
            args.location,
            { [verifiedUserId]: args.sport, count: 1 },
            0
          );
        } else {
          if (value[verifiedUserId]) {
            value[verifiedUserId] = args.sport;
            await locationStore.set(args.location, value, 0);
          } else {
            value[verifiedUserId] = args.sport;
            value.count = value.count + 1;
            await locationStore.set(args.location, value, 0);
          }
        }
      }
      await locationStore.set(verifiedUserId, args.location, 3600);
      return { values: "yolo" };
    } catch (error) {
      return error;
    }
  },
};
