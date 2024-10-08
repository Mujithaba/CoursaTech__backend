import express from "express";
import sendotp from "../services/sendMailer";
import AdminRepository from "../repository/adminRepository";
import AdminUseCase from "../../useCase/adminUseCase";
import AdminController from "../../adapters/adminController";
import { Next, Req, Res } from "../type/expressTypes";
import { adminAuth } from "../middleware/adminAuth";
import S3Uploader from "../services/s3BucketAWS";


const route = express.Router();


// services
const GenerateMail  = new sendotp()
const s3Uploader = new S3Uploader();

// repository
const adminRepository = new AdminRepository()
// use case
const adminUseCase = new AdminUseCase(adminRepository,GenerateMail,s3Uploader)
// controller
const adminController = new AdminController(adminUseCase);


// endpoints
route.get('/getAllUsers',adminAuth,(req:Req,res:Res,next:Next)=>adminController.getUsers(req,res,next))
route.patch('/userBlock',adminAuth,(req:Req,res:Res,next:Next)=>adminController.blockUser(req,res,next))
route.patch('/userUnblock',adminAuth,(req:Req,res:Res,next:Next)=>adminController.unblockUser(req,res,next))
route.get('/getAllTutors',adminAuth,(req:Req,res:Res,next:Next)=>adminController.getTutors(req,res,next))
route.patch('/tutorBlock',adminAuth,(req:Req,res:Res,next:Next)=>adminController.blockTutor(req,res,next))
route.patch('/tutorUnblock',adminAuth,(req:Req,res:Res,next:Next)=>adminController.unblockTutor(req,res,next))
route.post('/addCategory',adminAuth,(req:Req,res:Res,next:Next)=>adminController.saveCategory(req,res,next))
route.get('/getCagories',adminAuth,(req:Req,res:Res,next:Next)=>adminController.getCategories(req,res,next))
route.patch('/categoryUnlist',adminAuth,(req:Req,res:Res,next:Next)=>adminController.categoryUnlist(req,res,next))
route.patch('/categorylist',adminAuth,(req:Req,res:Res,next:Next)=>adminController.categoryList(req,res,next))
route.patch('/categoryEdit',adminAuth,(req:Req,res:Res,next:Next)=>adminController.categoryEdit(req,res,next))
route.get('/getCourse',adminAuth,(req:Req,res:Res,next:Next)=>adminController.getCourse(req,res,next))
route.get('/getViewCourse',adminAuth,(req:Req,res:Res,next:Next)=>adminController.ViewCourses(req,res,next))
route.get('/getUnapprovedCourse',adminAuth,(req:Req,res:Res,next:Next)=>adminController.unapprovedCourse(req,res,next))
route.patch('/courseApprove',adminAuth,(req:Req,res:Res,next:Next)=>adminController.courseApproved(req,res,next))
route.patch('/courseUnapprove',adminAuth,(req:Req,res:Res,next:Next)=>adminController.courseUnapproved(req,res,next))
route.get('/reviewsFetch',adminAuth,(req: Req, res: Res, next: Next)=>adminController.getReviews(req,res,next));
route.get('/fetchAssignments',adminAuth,(req: Req, res: Res, next: Next)=>adminController.fetchAssignments(req,res,next));
route.get('/getInstructor',adminAuth,(req: Req, res: Res, next: Next)=>adminController.getInstructor(req,res,next));
route.get('/getReports',adminAuth,(req: Req, res: Res, next: Next)=>adminController.getReports(req,res,next));
route.delete('/deleteReportCourse',adminAuth,(req: Req, res: Res, next: Next)=>adminController.deleteReportCourse(req,res,next));
route.get('/getRating',adminAuth,(req: Req, res: Res, next: Next)=>adminController.getRating(req,res,next));
route.get('/getDashboardData',adminAuth,(req: Req, res: Res, next: Next)=>adminController.getDashboardData(req,res,next));


  
export default route