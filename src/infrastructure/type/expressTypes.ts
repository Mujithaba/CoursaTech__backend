import { Request, Response, NextFunction } from "express"

// Exportings types like Request, Response,Next
export type Req = Request;
export type Res = Response;
export type Next = NextFunction;

export interface Obj{
    cateName:string
}

export interface courseInfo {
    title:string;
    description:string;
    instructor_id:string;
    category:string;
    price:string
  }


  export interface IFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
    type: string;
  }