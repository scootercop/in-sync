import { Request, Response } from "express";

export function Logger(req: Request, res: Response, next: Function) {
  console.log(
    [new Date().toLocaleString(), req.method, req.url, req.ip].join(" - ")
  );
  next();
}
