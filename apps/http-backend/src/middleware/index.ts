import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend_common";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        console.log("Authorization header is missing.");
        return res.status(401).json({message: "Authorization header is missing."});
    }

    const token = authHeader.split(" ")[1]; // Assuming "Bearer <token>" format

    if(!token){
        console.log("Token is missing from the Authorization header.");
        return res.status(401).json({message: "Token is missing from the Authorization header."});
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET)

        if(!decoded || typeof decoded !== "object"){
            console.log("Invalid token payload:", decoded);
            return res.status(401).json({message: "Invalid token payload."});
        }

        req.userId = decoded.userId; 
        next();
    } catch (error) {
        console.log("Invalid token:", error instanceof Error ? error.message : error);
        return res.status(401).json({message: "Invalid token."});
    }

}