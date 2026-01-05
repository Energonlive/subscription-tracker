import type { Request, Response, NextFunction } from "express";
import type { ArcjetNodeRequest } from "@arcjet/node";
import aj from "../config/arcjet";

const arcjetMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decision = await aj.protect(req as ArcjetNodeRequest, {requested: 1});

        if (decision.isDenied()){
            for (const result of decision.results){
                if(result.reason.isRateLimit()){
                    return res.status(429).json({error: 'Rate limit exceeded'});
                }
            }

            for(const result of decision.results){
                if(result.reason.isBot()){
                    return res.status(403).json({error: "Bot detected"});
                }
            }

            return res.status(403).json({error: 'Access denied'});
        }

        next();
    } catch (error) {
        console.error(`Arcject Middleware Error: ${(error as Error).message}`);
        next(error);
    }
}

export default arcjetMiddleware;