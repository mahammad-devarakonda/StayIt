const jwt = require("jsonwebtoken");
const { AuthenticationError } = require('apollo-server');

const userAuthMiddleware = (req) => {
  
    const query = req.body.query || "";
    if (query.includes("login") || query.includes("register")|| query.includes("verifyOTP")) {
        return null;  // Allow these queries without authentication
    }

    let token;
    if (req.cookies?.authToken) {
        token = req.cookies.authToken;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        throw new AuthenticationError("No authentication token provided. Please Sign in or Sign up!");

    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        return decodedToken;
    } catch (error) {
        throw new AuthenticationError("Invalid or expired token: " + error.message);
    }
};

module.exports = userAuthMiddleware;
