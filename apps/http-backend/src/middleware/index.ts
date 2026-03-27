import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend_common";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({message: "Authorization header is missing."});
    }

    const token = authHeader.split(" ")[1]; // Assuming "Bearer <token>" format

    if(!token){
        return res.status(401).json({message: "Token is missing from the Authorization header."});
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET)

        req.userId = decoded;
        next();
    } catch (error) {
        return res.status(401).json({message: "Invalid token."});
    }

}