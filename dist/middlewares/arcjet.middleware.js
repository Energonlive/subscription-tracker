import aj from "../config/arcjet.js";
const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, { requested: 1 });
        if (decision.isDenied()) {
            for (const result of decision.results) {
                if (result.reason.isRateLimit()) {
                    return res.status(429).json({ error: 'Rate limit exceeded' });
                }
            }
            for (const result of decision.results) {
                if (result.reason.isBot()) {
                    return res.status(403).json({ error: "Bot detected" });
                }
            }
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    }
    catch (error) {
        console.error(`Arcject Middleware Error: ${error.message}`);
        next(error);
    }
};
export default arcjetMiddleware;
