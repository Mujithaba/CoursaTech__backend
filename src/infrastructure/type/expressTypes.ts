import { Request, Response, NextFunction } from "express"

// Exportings types like Request, Response,Next
export type Req = Request;
export type Res = Response;
export type Next = NextFunction;

export interface Obj{
    cateName:string
}