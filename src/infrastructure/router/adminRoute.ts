import express from "express";
import sendotp from "../services/sendMailer";
import AdminRepository from "../repository/adminRepository";
import AdminUseCase from "../../useCase/adminUseCase";
import AdminController from "../../adapters/adminController";
import { Next, Req, Res } from "../type/expressTypes";


const route = express.Router();


// services
const GenerateMail  = new sendotp()

// repository
const adminRepository = new AdminRepository()
// use case
const adminUseCase = new AdminUseCase(adminRepository,GenerateMail)
// controller
const adminController = new AdminController(adminUseCase);


// endpoints
route.get('/getAllUsers',(req:Req,res:Res,next:Next)=>adminController.getUsers(req,res,next))
route.patch('/userBlock',(req:Req,res:Res,next:Next)=>adminController.blockUser(req,res,next))
route.patch('/userUnblock',(req:Req,res:Res,next:Next)=>adminController.unblockUser(req,res,next))
route.get('/getAllTutors',(req:Req,res:Res,next:Next)=>adminController.getTutors(req,res,next))
route.patch('/tutorBlock',(req:Req,res:Res,next:Next)=>adminController.blockTutor(req,res,next))
route.patch('/tutorUnblock',(req:Req,res:Res,next:Next)=>adminController.unblockTutor(req,res,next))

export default route