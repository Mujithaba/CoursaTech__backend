import express from "express";
import UserController from "../../adapters/userController";
import UserUseCase from "../../useCase/userUseCase";
import UserRepository from "../repository/userRepository";
import GenerateOtp from "../services/generateOtp";
import sendotp from "../services/sendMailer";
import EncryptPassword from "../services/bcryptPassword";
import { Next, Req, Res } from "../type/expressTypes";
import JwtToken from "../services/generateToken";
import { userAuth } from "../middleware/userAuth";
import S3Uploader from "../services/s3BucketAWS";
import errorHandle from "../middleware/errorHandle";
import Razorpay from "razorpay";
import { uploader } from "../middleware/multer";

const route = express.Router();

// services
const GenerateMail = new sendotp();
const generateOtp = new GenerateOtp();
const encryptPassword = new EncryptPassword()
const jwtToken = new JwtToken()
const s3Uploader = new S3Uploader();
const razorpay = new Razorpay ({
key_id:process.env.RAZORPAY_KEY_ID as string,
key_secret:process.env.RAZORPAY_SECRET_KEY as string  
})
 
// userRepository
const userRepository=new UserRepository()
// userUse Case
const userUseCase=new UserUseCase(userRepository,encryptPassword,generateOtp,GenerateMail,jwtToken,s3Uploader,razorpay)
// userController
const userController = new UserController(userUseCase)



route.post('/signUp',(req:Req,res:Res,next:Next)=> userController.signUp(req,res,next))
route.post('/verify',(req:Req,res:Res,next:Next)=>userController.verifyOTP(req,res,next));
route.post('/login',(req:Req,res:Res,next:Next)=>userController.login(req,res,next));
route.post('/googleIN',(req:Req,res:Res,next:Next)=>userController.googleUse(req,res,next));
route.post('/resendOTP',(req:Req,res:Res,next:Next)=>userController.resendOtp(req,res,next));
route.post('/forgotPassEmail',(req:Req,res:Res,next:Next)=>userController.forgotPass(req,res,next));
route.post('/forgotOTPverify',(req:Req,res:Res,next:Next)=>userController.forgotOTPverify(req,res,next));
route.patch('/forgotPasswordSave',(req:Req,res:Res,next:Next)=>userController.resetPassword(req,res,next));
route.get('/homePage',userAuth ,(req: Req, res: Res, next: Next) => userController.homePage(req, res, next));
route.get('/getCourse',userAuth ,(req: Req, res: Res, next: Next) => userController.getCourses(req, res, next));
route.get('/getViewCourse',userAuth ,(req: Req, res: Res, next: Next) => userController.ViewCourses(req, res, next));
route.post('/createPayment',userAuth,(req: Req, res: Res, next: Next)=>userController.coursePayment(req,res,next));
route.post('/paymentSuccess',userAuth,(req: Req, res: Res, next: Next)=>userController.paymentCompleted(req,res,next));
route.post('/sendUserMsg',userAuth,(req: Req, res: Res, next: Next)=>userController.storeUserMsg(req,res,next));
route.post('/uploadReviews',userAuth,(req: Req, res: Res, next: Next)=>userController.uploadReviews(req,res,next));
route.get('/reviewsFetch',userAuth,(req: Req, res: Res, next: Next)=>userController.getReviews(req,res,next));
route.get('/fetchAssignments',userAuth,(req: Req, res: Res, next: Next)=>userController.fetchAssignments(req,res,next));
route.get('/getInstructor',userAuth,(req: Req, res: Res, next: Next)=>userController.getInstructor(req,res,next));
route.post('/submitReport',userAuth,(req: Req, res: Res, next: Next)=>userController.submitTheReport(req,res,next));
route.get('/getRating',userAuth,(req: Req, res: Res, next: Next)=>userController.getRating(req,res,next));
route.get('/getStudentInfo',userAuth,(req: Req, res: Res, next: Next)=>userController.getStudentInfo(req,res,next));
route.patch('/updatedUserData',userAuth,uploader.single('profileImage'),(req: Req, res: Res, next: Next)=>userController.updatedUserData(req,res,next));
route.patch('/changePassword',userAuth,(req: Req, res: Res, next: Next)=>userController.changePassword(req,res,next));
route.get('/getAllCategories',userAuth,(req: Req, res: Res, next: Next)=>userController.getCategories(req,res,next));
route.get('/getHomePageData',(req: Req, res: Res, next: Next)=>userController.getHomePageData(req,res,next));
route.get('/getEntrolledCourse',userAuth,(req: Req, res: Res, next: Next)=>userController.entrolledCourseGet(req,res,next));



route.use(errorHandle)




export default route;