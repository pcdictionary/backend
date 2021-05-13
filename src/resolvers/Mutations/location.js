const location = {
  async setCheckin(parent, args, { locationStore, verifiedUserId }, info) {
    try {
      //create park
      const value = await locationStore.get(args.location);
      if (value == undefined) {
        // handle miss!
        await locationStore.set(args.location, {verifiedUserId: args.sport}, 0)
      }
      else{
        value[verifiedUserId] = args.sport
        await locationStore.set(args.location, value, 0)
      }
      await locationStore.set(verifiedUserId, args.location, 3600)
      return "works";
    } catch (error) {
      return error;
    }
  },
};

export default location;
