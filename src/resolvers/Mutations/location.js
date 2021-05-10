const location = {
  async set(parent, args, { locationStore }, info) {
    try {
        console.log("THIS MUTATION IS HIT")
        await locationStore.setex("YOLO", 60000,"PP" )
        const fetchingthis = await locationStore.get("YOLO", function(err, res){
            console.log(res)
        })
      return "WORKS";
    } catch (error) {
      return error;
    }
  },
};

export default location;
