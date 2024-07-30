import express from "express";
import sendotp from "../services/sendMailer";
import AdminRepository from "../repository/adminRepository";
import AdminUseCase from "../../useCase/adminUseCase";
import AdminController from "../../adapters/adminController";
import { Next, Req, Res } from "../type/expressTypes";
import { adminAuth } from "../middleware/adminAuth";


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
route.get('/getAllUsers',adminAuth,(req:Req,res:Res,next:Next)=>adminController.getUsers(req,res,next))
route.patch('/userBlock',adminAuth,(req:Req,res:Res,next:Next)=>adminController.blockUser(req,res,next))
route.patch('/userUnblock',adminAuth,(req:Req,res:Res,next:Next)=>adminController.unblockUser(req,res,next))
route.get('/getAllTutors',adminAuth,(req:Req,res:Res,next:Next)=>adminController.getTutors(req,res,next))
route.patch('/tutorBlock',adminAuth,(req:Req,res:Res,next:Next)=>adminController.blockTutor(req,res,next))
route.patch('/tutorUnblock',adminAuth,(req:Req,res:Res,next:Next)=>adminController.unblockTutor(req,res,next))
  
export default route