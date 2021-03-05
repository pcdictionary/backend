import jwt from "jsonwebtoken";

const getUserId = (request, requireAuth = true) => {
  const header = request.request ? request.request.headers.authorization : null;

  // for development
  const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTYxNDk3NjIxN30.4dpZMCOUfndHiNA4S6CNmQYfDgaZaLl2tzw4vcX91SM`;
  const decoded = jwt.verify(token, "thisisasecret");
  return decoded.userId;
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
