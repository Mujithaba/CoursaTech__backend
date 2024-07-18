import express from 'express';
import TutorController from '../../adapters/toturController';
import TutorUseCase from '../../useCase/tutorUseCase';
import TutorRepository from '../repository/tutorRepository';
import GenerateOtp from '../services/generateOtp';
import sendotp from '../services/sendMailer';
import EncryptPassword from '../services/bcryptPassword';
import { Req,Res,Next } from '../type/expressTypes';
import JwtToken from '../services/generateToken';


const route = express.Router();

// services
const GenerateMail = new sendotp();
const generateOtp =new GenerateOtp();
const encryptPassword = new EncryptPassword();
const jwtToken = new JwtToken();

// tutor repository
const tutorRepository = new TutorRepository();

// tutor usecase
const tutorUseCase = new TutorUseCase(tutorRepository,encryptPassword,generateOtp,GenerateMail,jwtToken);

// tutor controller
const tutorController = new TutorController(tutorUseCase);


route.post('/register',(req:Req,res:Res,next:Next)=>tutorController.signup(req,res,next));
route.post('/verify',(req:Req,res:Res,next:Next)=>tutorController.verifyOTP(req,res,next));
route.post('/login',(req:Req,res:Res,next:Next)=>tutorController.login(req,res,next));
route.post('/googleTutorIN',(req:Req,res:Res,next:Next)=>tutorController.googleUse(req,res,next));
route.post('/resendOTP',(req:Req,res:Res,next:Next)=>tutorController.resendOtp(req,res,next))



export default route;