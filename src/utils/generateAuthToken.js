/**
 * @jest-environment node
 */
 
 
import jwt from "jsonwebtoken";

const generateAuthToken = (userId = null, ownerId = null, lesseeId = null) => {
  if(userId===undefined) userId = null
  if(ownerId===undefined) ownerId = null
  if(lesseeId===undefined) lesseeId = null
  return jwt.sign({ userId:userId, ownerId:ownerId, lesseeId:lesseeId }, "thisisasecret");
};

export default generateAuthToken;
