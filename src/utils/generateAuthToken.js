/**
 * @jest-environment node
 */
 
 
import jwt from "jsonwebtoken";

const generateAuthToken = (userId = null) => {
  if(userId===undefined) userId = null

  return jwt.sign({ userId:userId }, "thisisasecret");
};

export default generateAuthToken;
