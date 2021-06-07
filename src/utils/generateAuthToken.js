/**
 * @jest-environment node
 */
 
 
import jwt from "jsonwebtoken";

const generateAuthToken = (userId = null) => {
  if(userId===undefined) userId = null
  const secret = process.env.JWT_SECRET
  return jwt.sign({ userId:userId }, secret);
};

export default generateAuthToken;
