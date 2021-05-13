function ParkUser(userInfo) {
  this.sport = userInfo.sport;
}

const location = {
  async getParksData(parent, args, { locationStore, verifiedUserId }, info) {
    try {
        const value = await locationStore.mget( args.locations );

      return JSON.stringify(value);
    } catch (error) {
      return error;
    }
  },
};

export default location;
