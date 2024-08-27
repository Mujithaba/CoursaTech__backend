import express from 'express';
import TutorController from '../../adapters/toturController';
import TutorUseCase from '../../useCase/tutorUseCase';
import TutorRepository from '../repository/tutorRepository';
import GenerateOtp from '../services/generateOtp';
import sendotp from '../services/sendMailer';
import EncryptPassword from '../services/bcryptPassword';
import { Req,Res,Next } from '../type/expressTypes';
import JwtToken from '../services/generateToken';
import { tutorAuth } from '../middleware/tutorAuth';
import S3Uploader from '../services/s3BucketAWS';
import { uploader } from '../middleware/multer';

const route = express.Router();

// services
const GenerateMail = new sendotp();
const generateOtp =new GenerateOtp();
const encryptPassword = new EncryptPassword();
const jwtToken = new JwtToken();
const s3Uploader = new S3Uploader();

// tutor repository
const tutorRepository = new TutorRepository();

// tutor usecase
const tutorUseCase = new TutorUseCase(tutorRepository,encryptPassword,generateOtp,GenerateMail,jwtToken,s3Uploader);

// tutor controller
const tutorController = new TutorController(tutorUseCase);


route.post('/register',(req:Req,res:Res,next:Next)=>tutorController.signup(req,res,next));
route.post('/verify',(req:Req,res:Res,next:Next)=>tutorController.verifyOTP(req,res,next));
route.post('/login',(req:Req,res:Res,next:Next)=>tutorController.login(req,res,next));
route.post('/googleTutorIN',(req:Req,res:Res,next:Next)=>tutorController.googleUse(req,res,next));
route.post('/resendOTP',(req:Req,res:Res,next:Next)=>tutorController.resendOtp(req,res,next));
route.post('/forgotPassEmail',(req:Req,res:Res,next:Next)=>tutorController.forgotPass(req,res,next));
route.post('/forgotOTPverify',(req:Req,res:Res,next:Next)=>tutorController.forgotOTPverify(req,res,next));
route.patch('/forgotPasswordSave',(req:Req,res:Res,next:Next)=>tutorController.resetPassword(req,res,next));
route.get('/dashboardPage',tutorAuth ,(req: Req, res: Res, next: Next) => tutorController.dashboardPage(req, res, next));
route.post('/basicInfoUpload',uploader.fields([ 
                                    { name: 'thumbnail', maxCount: 1 },
                                    { name: 'video', maxCount: 1 }
                                ]) ,(req: Req, res: Res, next: Next) => tutorController.courseBasicInfoSave(req, res, next));
route.get('/getAllCategories',(req:Req,res:Res,next:Next)=>tutorController.getCategories(req,res,next))
route.get('/getInstructorCourses',tutorAuth,(req:Req,res:Res,next:Next)=>tutorController.getInstructorCourses(req,res,next))
route.post('/uploadCuricculum',uploader.any(),(req:Req,res:Res,next:Next)=>tutorController.uploadingCuricculum(req,res,next))
route.get('/getViewCourse',tutorAuth,(req:Req,res:Res,next:Next)=>tutorController.getViewCourse(req,res,next))
route.get('/fetchtutorData',tutorAuth,(req:Req,res:Res,next:Next)=>tutorController.fetchtutorDetails(req,res,next))
route.patch('/profileDataSave',tutorAuth,(req:Req,res:Res,next:Next)=>tutorController.profileDataSave(req,res,next))
route.get('/storedMsgsFetching',tutorAuth,(req: Req, res: Res, next: Next)=>tutorController.storedMsgFetching(req,res,next))
route.get('/coursesForAssignment',tutorAuth,(req: Req, res: Res, next: Next)=>tutorController.coursesForAssignment(req,res,next))
route.post('/uploadingAssignment',uploader.single('assignment'),tutorAuth,(req: Req, res: Res, next: Next)=>tutorController.uploadingAssignment(req,res,next))
route.get('/assignmentsFetch',tutorAuth,(req: Req, res: Res, next: Next)=>tutorController.assignmentsFetch(req,res,next))




export default route;