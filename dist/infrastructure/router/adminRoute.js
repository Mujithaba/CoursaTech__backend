"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sendMailer_1 = __importDefault(require("../services/sendMailer"));
const adminRepository_1 = __importDefault(require("../repository/adminRepository"));
const adminUseCase_1 = __importDefault(require("../../useCase/adminUseCase"));
const adminController_1 = __importDefault(require("../../adapters/adminController"));
const adminAuth_1 = require("../middleware/adminAuth");
const s3BucketAWS_1 = __importDefault(require("../services/s3BucketAWS"));
const route = express_1.default.Router();
// services
const GenerateMail = new sendMailer_1.default();
const s3Uploader = new s3BucketAWS_1.default();
// repository
const adminRepository = new adminRepository_1.default();
// use case
const adminUseCase = new adminUseCase_1.default(adminRepository, GenerateMail, s3Uploader);
// controller
const adminController = new adminController_1.default(adminUseCase);
// endpoints
route.get('/getAllUsers', adminAuth_1.adminAuth, (req, res, next) => adminController.getUsers(req, res, next));
route.patch('/userBlock', adminAuth_1.adminAuth, (req, res, next) => adminController.blockUser(req, res, next));
route.patch('/userUnblock', adminAuth_1.adminAuth, (req, res, next) => adminController.unblockUser(req, res, next));
route.get('/getAllTutors', adminAuth_1.adminAuth, (req, res, next) => adminController.getTutors(req, res, next));
route.patch('/tutorBlock', adminAuth_1.adminAuth, (req, res, next) => adminController.blockTutor(req, res, next));
route.patch('/tutorUnblock', adminAuth_1.adminAuth, (req, res, next) => adminController.unblockTutor(req, res, next));
route.post('/addCategory', adminAuth_1.adminAuth, (req, res, next) => adminController.saveCategory(req, res, next));
route.get('/getCagories', adminAuth_1.adminAuth, (req, res, next) => adminController.getCategories(req, res, next));
route.patch('/categoryUnlist', adminAuth_1.adminAuth, (req, res, next) => adminController.categoryUnlist(req, res, next));
route.patch('/categorylist', adminAuth_1.adminAuth, (req, res, next) => adminController.categoryList(req, res, next));
route.patch('/categoryEdit', adminAuth_1.adminAuth, (req, res, next) => adminController.categoryEdit(req, res, next));
route.get('/getCourse', adminAuth_1.adminAuth, (req, res, next) => adminController.getCourse(req, res, next));
route.get('/getViewCourse', adminAuth_1.adminAuth, (req, res, next) => adminController.ViewCourses(req, res, next));
route.get('/getUnapprovedCourse', adminAuth_1.adminAuth, (req, res, next) => adminController.unapprovedCourse(req, res, next));
route.patch('/courseApprove', adminAuth_1.adminAuth, (req, res, next) => adminController.courseApproved(req, res, next));
route.patch('/courseUnapprove', adminAuth_1.adminAuth, (req, res, next) => adminController.courseUnapproved(req, res, next));
route.get('/reviewsFetch', adminAuth_1.adminAuth, (req, res, next) => adminController.getReviews(req, res, next));
route.get('/fetchAssignments', adminAuth_1.adminAuth, (req, res, next) => adminController.fetchAssignments(req, res, next));
route.get('/getInstructor', adminAuth_1.adminAuth, (req, res, next) => adminController.getInstructor(req, res, next));
route.get('/getReports', adminAuth_1.adminAuth, (req, res, next) => adminController.getReports(req, res, next));
route.delete('/deleteReportCourse', adminAuth_1.adminAuth, (req, res, next) => adminController.deleteReportCourse(req, res, next));
route.get('/getRating', adminAuth_1.adminAuth, (req, res, next) => adminController.getRating(req, res, next));
route.get('/getDashboardData', adminAuth_1.adminAuth, (req, res, next) => adminController.getDashboardData(req, res, next));
exports.default = route;
