
/**
 * @jest-environment node
 */

import jwt from "jsonwebtoken";

const getUserId = (request, requireAuth = true) => {
  const header = request.request ? request.request.headers.authorization : null;

  // for development
  // const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MTQ5ODU0MTR9.AZ0GMvlquPHW411phFPA9YqxAJpZzUdQEWjbtOhTGQc`;
  // const decoded = jwt.verify(token, "thisisasecret");
  // console.log(decoded)
  // return decoded.userId;
  //end

  if (header) {
    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, "thisisasecret");

    return decoded.userId;
  }

  if (requireAuth) {
    throw new Error("Authentication required");
  }

  return null;
};

export default getUserId;
