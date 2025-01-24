const jwt = require('jsonwebtoken');

const userAuthMiddleware = (req) => {
    
    const query = req.body.query || "";
    
    if (query.includes("login") || query.includes("register")) {
        return {}; 
    }

    
    const token = req.cookies?.authToken || req.headers.authorization?.split(' ')[1];
    if (!token) {
        throw new Error("No authentication token provided. Please Signin or Signup!");
    }

    try {
        const decodedToken = jwt.verify(token, "Bahubali#01");
        return decodedToken;
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};

module.exports = userAuthMiddleware;
