/**
 * @jest-environment node
 */

import jwt from "jsonwebtoken";

const getUserId = (request) => {
  const cookie =
    request.headers.authorization === "null" ? null : request.headers.authorization;
  if (cookie) {
    const token = cookie.split("=");
    const secret = process.env.JWT_SECRET
    const decoded = jwt.verify(token[1], secret);
    return decoded;
  }

  return null;
};

export default getUserId;
