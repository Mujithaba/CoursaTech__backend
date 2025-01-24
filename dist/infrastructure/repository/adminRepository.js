"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tutorModel_1 = __importDefault(require("../database/tutorModel/tutorModel"));
const userModel_1 = __importDefault(require("../database/userModels/userModel"));
const categoryModel_1 = __importDefault(require("../database/adminModel/categoryModel"));
const courseModel_1 = __importDefault(require("../database/tutorModel/courseModel"));
const tutorDetailsModel_1 = __importDefault(require("../database/tutorModel/tutorDetailsModel"));
const assignmentModel_1 = __importDefault(require("../database/tutorModel/assignmentModel"));
const reviewModel_1 = __importDefault(require("../database/commonModel/reviewModel"));
const reportModal_1 = __importDefault(require("../database/commonModel/reportModal"));
const paymentModel_1 = __importDefault(require("../database/commonModel/paymentModel"));
const walletModal_1 = __importDefault(require("../database/userModels/walletModal"));
class AdminRepository {
    async findUsers(page, limit) {
        const totalUsers = await userModel_1.default.countDocuments({ isAdmin: false });
        const users = await userModel_1.default
            .find({ isAdmin: false })
            .select("-password")
            .skip((page - 1) * limit)
            .limit(limit);
        return { users, totalUsers };
    }
    // block user
    async blockUser(userID) {
        const result = await userModel_1.default.updateOne({ _id: userID }, { $set: { isBlocked: true } });
        return result.modifiedCount > 0;
    }
    // unblock user
    async unblockUser(userID) {
        const result = await userModel_1.default.updateOne({ _id: userID }, { $set: { isBlocked: false } });
        return result.modifiedCount > 0;
    }
    // taking all tutors from db
    async findTutors(page, limit) {
        const totalTutors = await tutorModel_1.default.countDocuments();
        const tutors = await tutorModel_1.default
            .find()
            .skip((page - 1) * limit)
            .limit(limit);
        return { tutors, totalTutors };
    }
    // block user
    async blockTutor(tutorID) {
        const result = await tutorModel_1.default.updateOne({ _id: tutorID }, { $set: { isBlocked: true } });
        return result.modifiedCount > 0;
    }
    // unblock user
    async unblockTutor(tutorID) {
        const result = await tutorModel_1.default.updateOne({ _id: tutorID }, { $set: { isBlocked: false } });
        return result.modifiedCount > 0;
    }
    // category save
    async createCategory(category) {
        category.categoryName = category.categoryName.trim();
        const newCategoryLower = category.categoryName.toLowerCase();
        const existCategory = await categoryModel_1.default.findOne({
            categoryName: new RegExp(`^${newCategoryLower}$`, "i"),
        });
        if (existCategory) {
            return { success: false, reason: "The category already exists" };
        }
        const newCategory = new categoryModel_1.default(category);
        const saveCategory = await newCategory.save();
        return { success: true, reason: "Category added successfully" };
    }
    // category get
    async findCategory(page, limit) {
        const totalCategory = await categoryModel_1.default.countDocuments();
        const categories = await categoryModel_1.default
            .find()
            .skip((page - 1) * limit)
            .limit(limit);
        return { categories, totalCategory };
    }
    // unlist category
    async unlistCategory(categoryId) {
        const result = await categoryModel_1.default.updateOne({ _id: categoryId }, { $set: { is_listed: false } });
        return result.modifiedCount > 0;
    }
    // listed category
    async listCategory(categoryId) {
        const result = await categoryModel_1.default.updateOne({ _id: categoryId }, { $set: { is_listed: true } });
        return result.modifiedCount > 0;
    }
    // edit Category
    async UpdateCategory(newCategory, category_id) {
        newCategory = newCategory.trim();
        const newCategoryLower = newCategory.toLowerCase();
        const existCategory = await categoryModel_1.default.findOne({
            _id: { $ne: category_id },
            categoryName: new RegExp(`^${newCategoryLower}$`, "i"),
        });
        if (existCategory) {
            return { success: false, reason: "The category already exists" };
        }
        const result = await categoryModel_1.default.updateOne({ _id: category_id }, { $set: { categoryName: newCategory } });
        return {
            success: result.modifiedCount > 0,
            reason: result.modifiedCount > 0 ? "" : "Failed to update category",
        };
    }
    // get all course
    async getCourses(limit, skip) {
        const coursesData = await courseModel_1.default
            .find()
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
            .limit(limit)
            .skip(skip)
            .lean()
            .exec();
        return coursesData;
    }
    // course count
    async coursesCount() {
        const counts = await courseModel_1.default.countDocuments();
        return counts;
    }
    // getCourseView
    async getCourseView(course_id) {
        const getTutorCourses = await courseModel_1.default
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
        console.dir(getTutorCourses, { depth: null, colors: true });
        return getTutorCourses;
    }
    // course approvel
    async findUnapprovedCourse() {
        const totalUnverify = await courseModel_1.default.countDocuments({
            is_verified: false,
        });
        const getCourses = await courseModel_1.default
            .find({ is_verified: false })
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
        return { getCourses, totalUnverify };
    }
    // verifyCourse
    async verifyCourse(courseId) {
        const result = await courseModel_1.default.updateOne({ _id: courseId }, { $set: { is_verified: true } });
        return result.modifiedCount > 0;
    }
    // unverifyCourse
    async unverifyCourse(courseId) {
        const result = await courseModel_1.default.updateOne({ _id: courseId }, { $set: { is_verified: false } });
        return result.modifiedCount > 0;
    }
    // getReview
    async getReview(courseId) {
        const reviews = await reviewModel_1.default.find({ courseId: courseId }).sort({
            createdAt: -1,
        });
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
        console.log(tutor, instructor, "Fetched tutor and instructor details");
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
    // reportsFetch
    async reportsFetch() {
        const reports = await reportModal_1.default.find();
        return reports;
    }
    // findCourse for report course data
    async findCourseById(course_id) {
        const courseData = await courseModel_1.default.findById(course_id);
        const instructorId = String(courseData?.instructor_id);
        let course = {
            courseId: courseData?._id,
            courseName: courseData?.title,
            instructorId: instructorId,
            thamnail: courseData?.thambnail_Img,
        };
        return course;
    }
    // findInstructor for report course
    async findInstructorById(instructorId) {
        const instructorData = await tutorModel_1.default.findById(instructorId);
        let instructor = {
            instructorName: instructorData?.name,
            email: instructorData?.email,
        };
        return instructor;
    }
    // refundUserAmt
    async refundUserAmt(course_id, courseName) {
        try {
            const coursePaymentData = await paymentModel_1.default.find({ courseId: course_id });
            const refundPromises = coursePaymentData.map(async (refund) => {
                const existWallet = await walletModal_1.default.findOne({
                    userId: refund.userId,
                });
                if (!existWallet) {
                    const data = {
                        userId: refund.userId,
                        balance: refund.price,
                        history: [
                            {
                                type: "Credit",
                                amount: refund.price,
                                reason: `Deleted the ${courseName} course due to many reports.`,
                                date: new Date(),
                            },
                        ],
                    };
                    const newWallet = new walletModal_1.default(data);
                    await newWallet.save();
                }
                else {
                    existWallet.balance += refund.price;
                    existWallet.history.push({
                        type: "Credit",
                        amount: refund.price,
                        reason: `Deleted the ${courseName} course due to many reports.`,
                        date: new Date(),
                    });
                    await existWallet.save();
                }
            });
            await Promise.all(refundPromises);
            return true;
        }
        catch (error) {
            console.error("Error processing refunds:", error);
            return false;
        }
    }
    // courseDelete
    async courseDelete(courseId) {
        try {
            const resultDelete = await courseModel_1.default.findOne({ _id: courseId });
            if (!resultDelete) {
                console.error("No course found for the given course ID.");
                return false;
            }
            const result = await resultDelete.deleteOne();
            return !!result;
        }
        catch (error) {
            console.error("Error deleting course:", error);
            return false;
        }
    }
    // deleteReport
    async deleteReport(courseId) {
        try {
            const report = await reportModal_1.default.findOne({ courseId: courseId });
            if (!report) {
                console.error("No report found for the given course ID.");
                return false;
            }
            const result = await report.deleteOne();
            return !!result;
        }
        catch (error) {
            console.error("Error deleting report:", error);
            return false;
        }
    }
    // deletePayments
    async deletePayments(course_id) {
        const paymentsDlt = await paymentModel_1.default.deleteMany({ courseId: course_id });
        return !!paymentsDlt;
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
    // dashboard funtions
    async getTotalEarnings() {
        const totalEarnings = await paymentModel_1.default.aggregate([
            { $group: { _id: null, total: { $sum: "$price" } } },
        ]);
        return totalEarnings[0]?.total || 0;
    }
    async getTotalStudents() {
        const uniqueStudents = await userModel_1.default.find();
        return uniqueStudents.length;
    }
    async getActiveCourses() {
        return courseModel_1.default.countDocuments({
            is_listed: false,
        });
    }
    async getTopCourses() {
        const courses = await courseModel_1.default.find();
        const courseIds = courses.map((course) => String(course._id));
        console.log(courseIds, "courseIds");
        const ratings = await reviewModel_1.default.aggregate([
            {
                $match: { courseId: { $in: courseIds } },
            },
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
                $limit: 4,
            },
        ]);
        // Map course details with average ratings
        return courses
            .filter((course) => ratings.some((r) => r._id == course._id))
            .map((course) => ({
            title: course.title,
            rating: ratings.find((r) => r._id == course._id)?.averageRating || 1,
        }));
    }
    // course performace
    async getCoursePerformance() {
        const courses = await courseModel_1.default.find();
        const courseIds = courses.map((course) => String(course._id));
        const ratings = await reviewModel_1.default.aggregate([
            {
                $match: { courseId: { $in: courseIds } },
            },
            {
                $group: {
                    _id: "$courseId",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);
        return courses.map((course) => ({
            title: course.title,
            rating: ratings.find((r) => r._id == course._id)?.averageRating || 1,
        }));
    }
}
exports.default = AdminRepository;
