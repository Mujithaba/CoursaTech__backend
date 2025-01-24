"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const toturController_1 = __importDefault(require("../../adapters/toturController"));
const tutorUseCase_1 = __importDefault(require("../../useCase/tutorUseCase"));
const tutorRepository_1 = __importDefault(require("../repository/tutorRepository"));
const generateOtp_1 = __importDefault(require("../services/generateOtp"));
const sendMailer_1 = __importDefault(require("../services/sendMailer"));
const bcryptPassword_1 = __importDefault(require("../services/bcryptPassword"));
const generateToken_1 = __importDefault(require("../services/generateToken"));
const tutorAuth_1 = require("../middleware/tutorAuth");
const s3BucketAWS_1 = __importDefault(require("../services/s3BucketAWS"));
const multer_1 = require("../middleware/multer");
const route = express_1.default.Router();
// services
const GenerateMail = new sendMailer_1.default();
const generateOtp = new generateOtp_1.default();
const encryptPassword = new bcryptPassword_1.default();
const jwtToken = new generateToken_1.default();
const s3Uploader = new s3BucketAWS_1.default();
// tutor repository
const tutorRepository = new tutorRepository_1.default();
// tutor usecase
const tutorUseCase = new tutorUseCase_1.default(tutorRepository, encryptPassword, generateOtp, GenerateMail, jwtToken, s3Uploader);
// tutor controller
const tutorController = new toturController_1.default(tutorUseCase);
route.post('/register', (req, res, next) => tutorController.signup(req, res, next));
route.post('/verify', (req, res, next) => tutorController.verifyOTP(req, res, next));
route.post('/login', (req, res, next) => tutorController.login(req, res, next));
route.post('/googleTutorIN', (req, res, next) => tutorController.googleUse(req, res, next));
route.post('/resendOTP', (req, res, next) => tutorController.resendOtp(req, res, next));
route.post('/forgotPassEmail', (req, res, next) => tutorController.forgotPass(req, res, next));
route.post('/forgotOTPverify', (req, res, next) => tutorController.forgotOTPverify(req, res, next));
route.patch('/forgotPasswordSave', (req, res, next) => tutorController.resetPassword(req, res, next));
route.get('/dashboardPage', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.dashboardPage(req, res, next));
route.post('/basicInfoUpload', multer_1.uploader.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), (req, res, next) => tutorController.courseBasicInfoSave(req, res, next));
route.get('/getAllCategories', (req, res, next) => tutorController.getCategories(req, res, next));
route.get('/getInstructorCourses', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.getInstructorCourses(req, res, next));
route.post('/uploadCuricculum', multer_1.uploader.any(), (req, res, next) => tutorController.uploadingCuricculum(req, res, next));
route.get('/getViewCourse', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.getViewCourse(req, res, next));
route.get('/fetchtutorData', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.fetchtutorDetails(req, res, next));
route.patch('/profileDataSave', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.profileDataSave(req, res, next));
route.get('/storedMsgsFetching', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.storedMsgFetching(req, res, next));
route.get('/coursesForAssignment', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.coursesForAssignment(req, res, next));
route.post('/uploadingAssignment', multer_1.uploader.single('assignment'), tutorAuth_1.tutorAuth, (req, res, next) => tutorController.uploadingAssignment(req, res, next));
route.get('/assignmentsFetch', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.assignmentsFetch(req, res, next));
route.get('/reviewsFetch', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.getReviews(req, res, next));
route.get('/fetchAssignments', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.fetchAssignments(req, res, next));
route.get('/getInstructor', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.getInstructor(req, res, next));
route.get('/fetchDashboardData', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.fetchDashboardData(req, res, next));
route.get('/getCourseGrowth', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.getCourseGrowth(req, res, next));
route.patch('/updateProfileImg', tutorAuth_1.tutorAuth, multer_1.uploader.single('profileImage'), (req, res, next) => tutorController.updateProfileImg(req, res, next));
route.post('/sendInstructorMsg', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.sendInstructorMsg(req, res, next));
route.get('/getInitialMsg', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.getInitialMsg(req, res, next));
route.patch('/updatePassword', tutorAuth_1.tutorAuth, (req, res, next) => tutorController.updatePassword(req, res, next));
exports.default = route;
