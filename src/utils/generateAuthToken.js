import jwt from "jsonwebtoken";

const generateAuthToken = (userId) => {
  console.log(userId)
  return jwt.sign({ userId }, "thisisasecret");
};

export default generateAuthToken;
