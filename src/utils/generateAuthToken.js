import jwt from "jsonwebtoken";

const generateAuthToken = (userId) => {
  return jwt.sign({ userId }, "thisisasecret");
};

export default generateAuthToken;
