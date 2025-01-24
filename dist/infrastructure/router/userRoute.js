"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../../adapters/userController"));
const userUseCase_1 = __importDefault(require("../../useCase/userUseCase"));
const userRepository_1 = __importDefault(require("../repository/userRepository"));
const generateOtp_1 = __importDefault(require("../services/generateOtp"));
const sendMailer_1 = __importDefault(require("../services/sendMailer"));
const bcryptPassword_1 = __importDefault(require("../services/bcryptPassword"));
const generateToken_1 = __importDefault(require("../services/generateToken"));
const userAuth_1 = require("../middleware/userAuth");
const s3BucketAWS_1 = __importDefault(require("../services/s3BucketAWS"));
const errorHandle_1 = __importDefault(require("../middleware/errorHandle"));
const razorpay_1 = __importDefault(require("razorpay"));
const multer_1 = require("../middleware/multer");
const route = express_1.default.Router();
// services
const GenerateMail = new sendMailer_1.default();
const generateOtp = new generateOtp_1.default();
const encryptPassword = new bcryptPassword_1.default();
const jwtToken = new generateToken_1.default();
const s3Uploader = new s3BucketAWS_1.default();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});
// userRepository
const userRepository = new userRepository_1.default();
// userUse Case
const userUseCase = new userUseCase_1.default(userRepository, encryptPassword, generateOtp, GenerateMail, jwtToken, s3Uploader, razorpay);
// userController
const userController = new userController_1.default(userUseCase);
route.post('/signUp', (req, res, next) => userController.signUp(req, res, next));
route.post('/verify', (req, res, next) => userController.verifyOTP(req, res, next));
route.post('/login', (req, res, next) => userController.login(req, res, next));
route.post('/googleIN', (req, res, next) => userController.googleUse(req, res, next));
route.post('/resendOTP', (req, res, next) => userController.resendOtp(req, res, next));
route.post('/forgotPassEmail', (req, res, next) => userController.forgotPass(req, res, next));
route.post('/forgotOTPverify', (req, res, next) => userController.forgotOTPverify(req, res, next));
route.patch('/forgotPasswordSave', (req, res, next) => userController.resetPassword(req, res, next));
route.get('/homePage', userAuth_1.userAuth, (req, res, next) => userController.homePage(req, res, next));
route.get('/getCourse', userAuth_1.userAuth, (req, res, next) => userController.getCourses(req, res, next));
route.get('/getViewCourse', userAuth_1.userAuth, (req, res, next) => userController.ViewCourses(req, res, next));
route.post('/createPayment', userAuth_1.userAuth, (req, res, next) => userController.coursePayment(req, res, next));
route.post('/paymentSuccess', userAuth_1.userAuth, (req, res, next) => userController.paymentCompleted(req, res, next));
route.post('/sendUserMsg', userAuth_1.userAuth, (req, res, next) => userController.storeUserMsg(req, res, next));
route.post('/uploadReviews', userAuth_1.userAuth, (req, res, next) => userController.uploadReviews(req, res, next));
route.get('/reviewsFetch', userAuth_1.userAuth, (req, res, next) => userController.getReviews(req, res, next));
route.get('/fetchAssignments', userAuth_1.userAuth, (req, res, next) => userController.fetchAssignments(req, res, next));
route.get('/getInstructor', userAuth_1.userAuth, (req, res, next) => userController.getInstructor(req, res, next));
route.post('/submitReport', userAuth_1.userAuth, (req, res, next) => userController.submitTheReport(req, res, next));
route.get('/getRating', userAuth_1.userAuth, (req, res, next) => userController.getRating(req, res, next));
route.get('/getStudentInfo', userAuth_1.userAuth, (req, res, next) => userController.getStudentInfo(req, res, next));
route.patch('/updatedUserData', userAuth_1.userAuth, multer_1.uploader.single('profileImage'), (req, res, next) => userController.updatedUserData(req, res, next));
route.patch('/changePassword', userAuth_1.userAuth, (req, res, next) => userController.changePassword(req, res, next));
route.get('/getAllCategories', userAuth_1.userAuth, (req, res, next) => userController.getCategories(req, res, next));
route.get('/getHomePageData', (req, res, next) => userController.getHomePageData(req, res, next));
route.get('/getEntrolledCourse', userAuth_1.userAuth, (req, res, next) => userController.entrolledCourseGet(req, res, next));
route.get('/getInitialMsg', userAuth_1.userAuth, (req, res, next) => userController.getInitialMsg(req, res, next));
route.get('/getWallet', userAuth_1.userAuth, (req, res, next) => userController.getWallet(req, res, next));
route.post('/paymentWallet', userAuth_1.userAuth, (req, res, next) => userController.paymentWallet(req, res, next));
route.use(errorHandle_1.default);
exports.default = route;
