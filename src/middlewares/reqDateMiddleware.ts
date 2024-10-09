import { Request, Response, NextFunction } from "express";



const reqDateMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
    // req.body.date = new Date().toLocaleString();
    // console.log(`Request Date: ${req.body.date}`);
    next();
}

export default reqDateMiddleware;
