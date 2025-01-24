"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TutorController {
    constructor(tutorUseCase) {
        this.tutorUseCase = tutorUseCase;
    }
    async signup(req, res, next) {
        try {
            const tutorVerify = await this.tutorUseCase.checkExist(req.body.email);
            if (tutorVerify.data.status == true) {
                const sendOtp = await this.tutorUseCase.signup(req.body.name, req.body.email);
                return res.status(sendOtp.status).json(sendOtp.data);
            }
            else {
                return res.status(tutorVerify.status).json(tutorVerify.data);
            }
        }
        catch (error) {
            next(error);
        }
    }
    //   otp verification of tutor
    async verifyOTP(req, res, next) {
        try {
            const data = req.body;
            const OTPverification = await this.tutorUseCase.verify(data);
            if (OTPverification.status == 400) {
                return res
                    .status(OTPverification.status)
                    .json({ message: OTPverification.message });
            }
            if (OTPverification.data && OTPverification.status == 200) {
                const savedTutor = await this.tutorUseCase.saveTutor(OTPverification.data);
                res
                    .status(200)
                    .json({ message: "Tutor saved successfully", data: savedTutor });
            }
        }
        catch (error) {
            next(error);
        }
    }
    // login
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await this.tutorUseCase.login(email, password);
            return res.status(user.status).json(user.data);
        }
        catch (error) {
            next(error);
        }
    }
    // resendOTP
    async resendOtp(req, res, next) {
        try {
            const { name, email } = req.body;
            const resendOTP = await this.tutorUseCase.resend_otp(name, email);
            return res.status(resendOTP.status).json(resendOTP.data);
        }
        catch (error) {
            next(error);
        }
    }
    // google sign up or login
    async googleUse(req, res, next) {
        try {
            const { name, email, phone, password, isGoogled } = req.body;
            const checkExist = await this.tutorUseCase.checkExist(email);
            if (checkExist.data.status == true) {
                const data = {
                    name: name,
                    email: email,
                    phone: phone,
                    password: password,
                    isGoogle: isGoogled,
                };
                await this.tutorUseCase.saveTutor(data);
                const tutor = await this.tutorUseCase.login(email, password);
                return res.status(tutor.status).json(tutor.data);
            }
            else if (checkExist.data.status == false) {
                const user = await this.tutorUseCase.login(email, password);
                return res.status(user.status).json(user.data);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // forgotpassword
    async forgotPass(req, res, next) {
        try {
            const email = req.body.email;
            const tutor = await this.tutorUseCase.forgotPassword(email);
            if (tutor.status == 403) {
                return res.status(tutor.status).json(tutor.data);
            }
            else if (tutor.status == 200) {
                return res.status(tutor.status).json(tutor.data);
            }
            else {
                return res.status(tutor.status).json(tutor.data);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // forgot pass otp verify
    async forgotOTPverify(req, res, next) {
        try {
            const data = req.body;
            const verify = await this.tutorUseCase.verify(data);
            if (verify.status == 400) {
                return res.status(verify.status).json({ message: verify.message });
            }
            else if (verify.status == 200) {
                return res.status(verify.status).json(verify);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // reset password
    async resetPassword(req, res, next) {
        try {
            console.log("geooo");
            const { email, password } = req.body;
            const result = await this.tutorUseCase.resetPassword(email, password);
            if (result.status == 200) {
                return res.status(result.status).json({ message: result.message });
            }
            else {
                return res.status(result.status).json({ message: result.message });
            }
        }
        catch (error) {
            next(error);
        }
    }
    // homePage
    async dashboardPage(req, res, next) {
        try {
            const tutorId = req.query.id;
            const tutor = await this.tutorUseCase.getUser(tutorId);
            if (tutor.status == 200) {
                return res.status(tutor.status).json(tutor.data?.data);
            }
            else {
                return res.status(tutor.status).json(tutor.data?.message);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // course basic info save
    async courseBasicInfoSave(req, res, next) {
        try {
            const files = req.files;
            const thumbnailFiles = files["thumbnail"];
            const videoFiles = files["video"];
            const thumbnail = thumbnailFiles[0];
            const video = videoFiles[0];
            const { title, description, instructor_id, category, price } = req.body;
            const courseInfo = { title, description, instructor_id, category, price };
            const basicsData = await this.tutorUseCase.uploadBasicInfo(thumbnail, video, courseInfo);
            if (basicsData) {
                return res.status(basicsData.status).json({
                    message: "Course created successfully,Now you can add modules",
                    data: basicsData,
                });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async getCategories(req, res, next) {
        try {
            const categories = await this.tutorUseCase.getCategory();
            if (categories) {
                return res.status(categories.status).json(categories.data);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // get instructors courses
    async getInstructorCourses(req, res, next) {
        try {
            const id = req.query.id;
            const { page = 1, limit = 10 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const instructorCourses = await this.tutorUseCase.getCourses(id, Number(limit), skip);
            if (instructorCourses) {
                const totalItems = await this.tutorUseCase.countCourses(id);
                return res
                    .status(instructorCourses.status)
                    .json({ ...instructorCourses.data, totalItems });
            }
            else {
                return res.status(404).json({ message: "No courses found" });
            }
        }
        catch (error) {
            next(error);
        }
    }
    // uploading Curicculum
    async uploadingCuricculum(req, res, next) {
        try {
            const course_id = req.body.course_id;
            const modules = JSON.parse(req.body.modules);
            const files = req.files;
            if (!Array.isArray(modules) || !course_id) {
                return res.status(400).json({ message: "Invalid input" });
            }
            const uploadData = await this.tutorUseCase.uploadCuricculum(course_id, modules, files);
            return res.status(uploadData.status).json(uploadData.data);
        }
        catch (error) {
            console.error("Error in uploadingCuricculum:", error);
            next(error);
        }
    }
    async getViewCourse(req, res, next) {
        try {
            const id = req.query.id;
            const courseViewData = await this.tutorUseCase.getViewCourse(id);
            if (courseViewData) {
                return res.status(courseViewData.status).json(courseViewData.data);
            }
            else {
                return res.status(404).json({ message: "No course found" });
            }
        }
        catch (error) {
            next(error);
        }
    }
    // profile data fetching
    async fetchtutorDetails(req, res, next) {
        try {
            const tutorID = req.query.tutorID;
            const getInstructorDetails = await this.tutorUseCase.getInstructorData(tutorID);
            if (getInstructorDetails) {
                return res
                    .status(getInstructorDetails.status)
                    .json(getInstructorDetails);
            }
        }
        catch (error) {
            next(error);
        }
    }
    //profileDataSave
    async profileDataSave(req, res, next) {
        try {
            const { registerData, instructorProfile } = req.body;
            const saveProfileDatas = await this.tutorUseCase.saveProfileDetailes(registerData, instructorProfile);
            if (saveProfileDatas) {
                return res.status(saveProfileDatas.status).json(saveProfileDatas);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // storedMsgsFetching
    async storedMsgFetching(req, res, next) {
        try {
            const instructorid = req.query.instructorId;
            const conversationReceiver = await this.tutorUseCase.receiverConversations(instructorid);
            if (conversationReceiver) {
                return res
                    .status(conversationReceiver.status)
                    .json(conversationReceiver);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // coursesForAssignment
    async coursesForAssignment(req, res, next) {
        try {
            const instructorId = req.query.instructorId;
            const courseDatas = await this.tutorUseCase.fetchInstructorCourses(instructorId);
            if (courseDatas) {
                return res.status(courseDatas.status).json(courseDatas);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // uploadingAssignment
    async uploadingAssignment(req, res, next) {
        try {
            const assignment = req.file;
            const { courseTitle, courseId } = req.body;
            const upload = await this.tutorUseCase.uploadAssignment(courseId, courseTitle, assignment);
            if (upload) {
                return res.status(upload.status).json(upload);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // assignmentsFetch
    async assignmentsFetch(req, res, next) {
        try {
            const instructorId = req.query.instructorId;
            const assignmentData = await this.tutorUseCase.fetchingAssignments(instructorId);
            console.log(assignmentData);
            return res.status(assignmentData.status).json(assignmentData.data);
        }
        catch (error) {
            next(error);
        }
    }
    // reviewsFetch
    async getReviews(req, res, next) {
        try {
            const courseId = req.query.courseId;
            const getReview = await this.tutorUseCase.reviewsFetch(courseId);
            if (getReview) {
                return res.status(getReview.status).json(getReview);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // fetchAssignments
    async fetchAssignments(req, res, next) {
        try {
            const courseId = req.query.courseId;
            const assignmentsData = await this.tutorUseCase.getAssignments(courseId);
            return res.status(assignmentsData.status).json(assignmentsData.data);
        }
        catch (error) {
            next(error);
        }
    }
    // getInstructor
    async getInstructor(req, res, next) {
        try {
            const instructorId = req.query.instructorId;
            const instructorData = await this.tutorUseCase.getInstructorDetails(instructorId);
            return res.status(instructorData.status).json(instructorData.data);
        }
        catch (error) {
            next(error);
        }
    }
    // fetchDashboardData
    async fetchDashboardData(req, res, next) {
        try {
            const instructorId = req.query.instructorId;
            const dashboardData = await this.tutorUseCase.dashboardFetch(instructorId);
            return res.status(dashboardData.status).json(dashboardData);
        }
        catch (error) {
            next(error);
        }
    }
    // getCourseGrowth
    async getCourseGrowth(req, res, next) {
        try {
            const instructorId = req.query.instructorId;
            const courseGrowthData = await this.tutorUseCase.courseGrowth(instructorId);
            return res.status(courseGrowthData.status).json(courseGrowthData);
        }
        catch (error) {
            next(error);
        }
    }
    // updateProfileImg
    async updateProfileImg(req, res, next) {
        try {
            const { tutorId } = req.body;
            const profileImage = req.file;
            const result = await this.tutorUseCase.updateProfileDp(tutorId, profileImage);
            return res.status(result.status).json(result.data);
        }
        catch (error) {
            next(error);
        }
    }
    // sendInstructorMsg
    async sendInstructorMsg(req, res, next) {
        try {
            const { msg, userId, instructorId, userName, instructorName } = req.body;
            const saveMsg = await this.tutorUseCase.storeUserMsg(msg, instructorId, userId, userName, instructorName);
            if (saveMsg) {
                return res.status(saveMsg.status).json(saveMsg);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // getInitialMsg
    async getInitialMsg(req, res, next) {
        try {
            const senderId = req.query.senderId;
            const receiverId = req.query.receiverId;
            const initialMsgs = await this.tutorUseCase.getPreviousMsgs(senderId, receiverId);
            return res.status(initialMsgs.status).json(initialMsgs.data);
        }
        catch (error) {
            next(error);
        }
    }
    // updatePassword
    async updatePassword(req, res, next) {
        try {
            const { instructorId, currentPassword, newPassword } = req.body;
            const result = await this.tutorUseCase.updatePassword(instructorId, currentPassword, newPassword);
            return res.status(result?.status).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = TutorController;
