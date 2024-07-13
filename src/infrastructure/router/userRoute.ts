import express from "express";
import UserController from "../../adapters/userController";
import UserUseCase from "../../useCase/userUseCase";
import UserRepository from "../repository/userRepository";
import GenerateOtp from "../services/generateOtp";
import sendotp from "../services/sendMailer";
import EncryptPassword from "../services/bcryptPassword";
import { Next, Req, Res } from "../type/expressTypes";
import JwtToken from "../services/generateToken";


const route = express.Router();

// services
const GenerateMail = new sendotp();
const generateOtp = new GenerateOtp();
const encryptPassword = new EncryptPassword()
const jwtToken = new JwtToken()

// userRepository
const userRepository=new UserRepository()
// userUse Case
const userUseCase=new UserUseCase(userRepository,encryptPassword,generateOtp,GenerateMail,jwtToken)
// userController
const userController = new UserController(userUseCase)



route.post('/signUp',(req:Req,res:Res,next:Next)=> userController.signUp(req,res,next))
route.post('/verify',(req:Req,res:Res,next:Next)=>userController.verifyOTP(req,res,next));
route.post('/login',(req:Req,res:Res,next:Next)=>userController.login(req,res,next));


export default route;