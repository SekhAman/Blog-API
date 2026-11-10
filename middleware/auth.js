const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).send({
            message: "Access denied. Token required."
        });
    }

    const actualToken = token.split(" ")[1];

    try {
        const decoded = jwt.verify(
            actualToken,
            process.env.JWT_SECRET
        );

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send({
            message: "Invalid or expired token."
        });
    }
};

module.exports = auth;