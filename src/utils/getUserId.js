
/**
 * @jest-environment node
 */

import jwt from "jsonwebtoken";

const getUserId = (request, requireAuth = true) => {
  const cookie = request.headers.cookie ? request.headers.cookie : null;
  console.log(request)
  if (cookie) {
    const token = cookie.split("=");
    const decoded = jwt.verify(token[1], "thisisasecret");
    return decoded.userId;
  }

  if (requireAuth) {
    return new Error("Authentication required");
  }

  return null;
};

export default getUserId;
