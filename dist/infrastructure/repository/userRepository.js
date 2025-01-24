"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../database/userModels/userModel"));
const otpDocModel_1 = __importDefault(require("../database/commonModel/otpDocModel"));
const courseModel_1 = __importDefault(require("../database/tutorModel/courseModel"));
const paymentModel_1 = __importDefault(require("../database/commonModel/paymentModel"));
const messageModel_1 = __importDefault(require("../database/commonModel/messageModel"));
const conversationModel_1 = __importDefault(require("../database/commonModel/conversationModel"));
const reviewModel_1 = __importDefault(require("../database/commonModel/reviewModel"));
const assignmentModel_1 = __importDefault(require("../database/tutorModel/assignmentModel"));
const tutorDetailsModel_1 = __importDefault(require("../database/tutorModel/tutorDetailsModel"));
const tutorModel_1 = __importDefault(require("../database/tutorModel/tutorModel"));
const reportModal_1 = __importDefault(require("../database/commonModel/reportModal"));
const categoryModel_1 = __importDefault(require("../database/adminModel/categoryModel"));
const walletModal_1 = __importDefault(require("../database/userModels/walletModal"));
class UserRepository {
    // saving user details to  database
    async saves(user) {
        const newUser = new userModel_1.default(user);
        const saveUser = await newUser.save();
        return saveUser;
    }
    // email finding from DB
    async findByEmail(email) {
        const userData = await userModel_1.default.findOne({ email: email });
        return userData;
    }
    // find by id
    async findById(userId) {
        const userData = await userModel_1.default.findById(userId).exec();
        return userData;
    }
    // otp details saving in db using TTL  --- change otp doc ts in promise--
    async saveOtp(name, email, otp, role) {
        const newOtpDoc = new otpDocModel_1.default({
            name: name,
            email: email,
            otp: otp,
            role: role,
            generatedAt: new Date(),
        });
        const saveOtp = await newOtpDoc.save();
        return saveOtp;
    }
    // otp details finding from otpDB using email
    async findOtpByEmail(email, role) {
        const otpData = await otpDocModel_1.default
            .findOne({ email: email, role: role })
            .sort({ generatedAt: -1 });
        return otpData;
    }
    async forgotPassUpdate(email, hashPassword) {
        const result = await userModel_1.default.updateOne({ email: email }, { $set: { password: hashPassword } });
        return result.modifiedCount > 0;
    }
    // get all course
    async getCourses(limit, skip, searchTerm, category) {
        let query = { is_verified: true };
        if (searchTerm) {
            query.title = { $regex: searchTerm, $options: "i" };
        }
        if (category) {
            const categoryObj = await categoryModel_1.default.findOne({
                categoryName: category,
            });
            if (categoryObj) {
                query.category_id = categoryObj._id;
            }
        }
        const coursesData = await courseModel_1.default
            .find(query)
            .populate({ path: "category_id", select: "categoryName" })
            .populate({
            path: "chapters",
            model: "Module",
            select: "name lectures createdAt",
            populate: {
                path: "lectures",
                model: "Lecture",
                select: "title description video pdf createdAt",
            },
        })
            .limit(limit)
            .skip(skip)
            .lean()
            .exec();
        return coursesData;
    }
    async coursesCount(searchTerm, category) {
        let query = { is_verified: true };
        if (searchTerm) {
            query.title = { $regex: searchTerm, $options: "i" };
        }
        if (category) {
            const categoryObj = await categoryModel_1.default.findOne({
                categoryName: category,
            });
            if (categoryObj) {
                query.category_id = categoryObj._id;
            }
        }
        const counts = await courseModel_1.default.countDocuments(query);
        return counts;
    }
    // getCourseView
    async getCourseView(course_id, userid) {
        const paymentDocument = await paymentModel_1.default.findOne({
            userId: userid,
            courseId: course_id,
        }).lean();
        const wallet = await walletModal_1.default.findOne({ userId: userid });
        const hasPurchased = !!paymentDocument;
        const getViewCourses = await courseModel_1.default
            .findById(course_id)
            .populate({
            path: "category_id",
            select: "categoryName",
        })
            .populate({
            path: "chapters",
            model: "Module",
            select: "name lectures createdAt",
            populate: {
                path: "lectures",
                model: "Lecture",
                select: "title description  video  pdf createdAt",
            },
        })
            .lean()
            .exec();
        return {
            getCourses: getViewCourses,
            isPurchased: hasPurchased,
            getWallet: wallet,
        };
    }
    // find course
    async findCourseById(course_id) {
        const course = await courseModel_1.default.findById(course_id);
        return course?.toObject();
    }
    // savePayments
    async savePayments(payment) {
        const newPayment = new paymentModel_1.default(payment);
        const savedPayment = await newPayment.save();
        return savedPayment;
    }
    // store user Msg
    async storeMesssage(messages) {
        const newMessage = new messageModel_1.default(messages);
        const storeMsgs = await newMessage.save();
        return storeMsgs;
    }
    // createConversation
    async createConversation(lastMessage) {
        // Check if the conversation already exists
        const conversationMsg = await conversationModel_1.default.findOne({
            $or: [
                { senderId: lastMessage.senderId, receiverId: lastMessage.receiverId },
                { senderId: lastMessage.receiverId, receiverId: lastMessage.senderId },
            ],
        });
        let lastConversation;
        if (conversationMsg) {
            // Update the existing conversation with the latest message and sender name
            lastConversation = await conversationModel_1.default.findOneAndUpdate({
                $or: [
                    {
                        senderId: lastMessage.senderId,
                        receiverId: lastMessage.receiverId,
                    },
                    {
                        senderId: lastMessage.receiverId,
                        receiverId: lastMessage.senderId,
                    },
                ],
            }, {
                $set: {
                    senderName: lastMessage.senderName,
                    instructorName: lastMessage.instructorName,
                    lastMessage: lastMessage.lastMessage,
                },
            }, { new: true });
        }
        else {
            // Create a new conversation
            const newConversation = new conversationModel_1.default(lastMessage);
            lastConversation = await newConversation.save();
        }
        return lastConversation;
    }
    // upload reviews
    async uploadReview(data) {
        const newReview = new reviewModel_1.default(data);
        const saveReview = await newReview.save();
        return !!saveReview;
    }
    // getReview
    async getReview(courseId) {
        const reviews = await reviewModel_1.default.find({ courseId: courseId }).sort({
            createdAt: -1,
        });
        console.log(reviews, "getReview");
        const reviewData = reviews.map((review) => ({
            userName: review.userName,
            feedback: review.feedback,
            rating: review.rating,
        }));
        return reviewData;
    }
    // fetchAssignments
    async fetchAssignments(courseId) {
        const assigmentsData = await assignmentModel_1.default.find({ courseId: courseId });
        return assigmentsData;
    }
    // fetchInstructor
    async fetchInstructor(instructorId) {
        const tutor = await tutorModel_1.default.findById(instructorId);
        const instructor = await tutorDetailsModel_1.default.findOne({
            instructorId: instructorId,
        });
        // console.log(tutor, instructor, "Fetched tutor and instructor details");
        const instructor_id = tutor?._id;
        const instructorname = tutor?.name;
        const instructormail = tutor?.email;
        const instructorData = {
            instructorId: instructor_id,
            instructorName: instructorname,
            instructorEmail: instructormail,
            aboutBio: instructor?.aboutBio || "",
            companyName: instructor?.companyName || "",
            experience: instructor?.experience || "",
            position: instructor?.position || "",
            profileImg: instructor?.profileImg || "",
        };
        return instructorData;
    }
    // reportCourese
    async reportCourese(courseId, userId, issueType, description) {
        try {
            const reportExist = await reportModal_1.default.findOne({ courseId });
            if (reportExist) {
                if (!reportExist.userId.includes(userId)) {
                    reportExist.userId.push(userId);
                    if (!reportExist.issueType.includes(issueType)) {
                        reportExist.issueType.push(issueType);
                    }
                    if (!reportExist.description.includes(description)) {
                        reportExist.description.push(description);
                    }
                }
                reportExist.reportedCount += 1;
                await reportExist.save();
            }
            else {
                const newReport = new reportModal_1.default({
                    courseId,
                    userId: [userId],
                    issueType: [issueType],
                    description: [description],
                    reportedCount: 1,
                });
                await newReport.save();
            }
            return true;
        }
        catch (error) {
            console.error("Error reporting course:", error);
            return false;
        }
    }
    // userReportExist
    async userReportExist(courseId, userId) {
        const userExistReport = await reportModal_1.default.findOne({ courseId });
        if (userExistReport) {
            return userExistReport.userId.includes(userId);
        }
        return false;
    }
    // ratesGet
    async ratesGet() {
        const ratings = await reviewModel_1.default.aggregate([
            {
                $group: {
                    _id: "$courseId",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);
        return ratings;
    }
    // saveEditData
    async saveEditData(userId, data) {
        const updatedUser = await userModel_1.default
            .findByIdAndUpdate(userId, { $set: data }, { new: true })
            .select("-password");
        return updatedUser;
    }
    // findUser
    async findUser(userId) {
        const user = await userModel_1.default.findById(userId);
        return user;
    }
    // changedPassword
    async changedPassword(userId, hashedNewPassword) {
        const result = await userModel_1.default.updateOne({ _id: userId }, { $set: { password: hashedNewPassword } });
        return result.modifiedCount > 0;
    }
    // get category
    async getCategory() {
        const getData = await categoryModel_1.default.find({ is_listed: true });
        return getData;
    }
    // ratedCourseHome
    async ratedCourseHome() {
        const ratings = await reviewModel_1.default.aggregate([
            {
                $group: {
                    _id: "$courseId",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
            {
                $sort: { averageRating: -1 },
            },
            {
                $limit: 3,
            },
        ]);
        return ratings;
    }
    async findInstructorById(instructorId) {
        const name = await tutorModel_1.default.findById(instructorId);
        const details = await tutorDetailsModel_1.default.findOne({
            instructorId: instructorId,
        });
        const instructorData = {
            _id: name?._id,
            name: name?.name,
            instructorImg: details?.profileImg,
            position: details?.position,
        };
        return instructorData;
    }
    // entrolledUserExist
    async enrolledUserExist(userId) {
        const existUser = await paymentModel_1.default.find({ userId: userId });
        return existUser;
    }
    // getMsgs
    async getMsgs(senderId, receiverId) {
        const senderIdMsgs = await messageModel_1.default.find({
            senderId: senderId,
            receiverId: receiverId,
        });
        const receiverIdMsgs = await messageModel_1.default.find({
            senderId: receiverId,
            receiverId: senderId,
        });
        const allMessages = [...senderIdMsgs, ...receiverIdMsgs];
        allMessages.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateA - dateB;
        });
        return allMessages.length ? allMessages : null;
    }
    // walletDatas
    async walletDatas(userId) {
        const getWallet = await walletModal_1.default.findOne({ userId: userId });
        return getWallet;
    }
    // saveWalletPayment
    async saveWalletPayment(payment) {
        const newPayment = new paymentModel_1.default(payment);
        const savedPayment = await newPayment.save();
        return savedPayment;
    }
    // updateWallet
    async updateWallet(userId, price, courseName) {
        const updateResult = await walletModal_1.default.updateOne({ userId: userId }, {
            $inc: { balance: -price },
            $push: {
                history: {
                    type: "Debit",
                    amount: price,
                    reason: `Purchased the ${courseName} using wallet cash`,
                    date: new Date(),
                },
            },
        });
        return updateResult.modifiedCount > 0;
    }
}
exports.default = UserRepository;
