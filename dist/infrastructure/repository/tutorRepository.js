"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tutorModel_1 = __importDefault(require("../database/tutorModel/tutorModel"));
const otpDocModel_1 = __importDefault(require("../database/commonModel/otpDocModel"));
const courseModel_1 = __importDefault(require("../database/tutorModel/courseModel"));
const categoryModel_1 = __importDefault(require("../database/adminModel/categoryModel"));
const lectureModel_1 = __importDefault(require("../database/tutorModel/lectureModel"));
const moduleModel_1 = __importDefault(require("../database/tutorModel/moduleModel"));
const tutorDetailsModel_1 = __importDefault(require("../database/tutorModel/tutorDetailsModel"));
const conversationModel_1 = __importDefault(require("../database/commonModel/conversationModel"));
const assignmentModel_1 = __importDefault(require("../database/tutorModel/assignmentModel"));
const reviewModel_1 = __importDefault(require("../database/commonModel/reviewModel"));
const paymentModel_1 = __importDefault(require("../database/commonModel/paymentModel"));
const messageModel_1 = __importDefault(require("../database/commonModel/messageModel"));
class TutorRepository {
    //save tutor to DB
    async saves(tutor) {
        const newTutor = new tutorModel_1.default(tutor);
        const saveTutor = await newTutor.save();
        return saveTutor;
    }
    // email finding from DB
    async findByEmail(email) {
        const res = await tutorModel_1.default.findOne({ email: email });
        return res;
    }
    // find by id
    async findById(tutorId) {
        const tutorData = await tutorModel_1.default.findById({ _id: tutorId });
        return tutorData;
    }
    // Instructor Details uploading
    async uploadInstructorDetails(details) {
        const newDetailInstrucotr = new tutorDetailsModel_1.default(details);
        const saveDetails = await newDetailInstrucotr.save();
        return saveDetails;
    }
    // instructor details document checking
    async instructorDetailsExistId(instructor_id) {
        const instructorData = await tutorDetailsModel_1.default.findOne({
            instructorId: instructor_id,
        });
        return instructorData;
    }
    // register data update
    async updateTheRegister(registerData) {
        const { _id, ...updateFields } = registerData;
        if (!_id) {
            throw new Error("ID is required for updating the user data");
        }
        // Update the document and return the updated document
        const updatedTutor = await tutorModel_1.default
            .findOneAndUpdate({ _id }, { $set: updateFields }, { new: true })
            .lean();
        return updatedTutor;
    }
    // updateTheInstructorDetails
    async updateTheInstructorDetails(instructorDetail) {
        const { _id, ...updateFields } = instructorDetail;
        if (!_id) {
            throw new Error("ID is required for updating the user data");
        }
        const result = await tutorDetailsModel_1.default.updateOne({ _id }, { $set: updateFields });
        return result.modifiedCount > 0;
    }
    // otp taking from db
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
    async findOtpByEmail(email, role) {
        const otpData = await otpDocModel_1.default.findOne({
            email: email,
            role: role,
        }).sort({ generatedAt: -1 });
        console.log(otpData, "repo otp data..........................");
        return otpData;
    }
    async forgotPassUpdate(email, hashPassword) {
        const result = await tutorModel_1.default.updateOne({ email: email }, { $set: { password: hashPassword } });
        return result.modifiedCount > 0;
    }
    // course creation
    async createCourse(course) {
        const newCOurse = new courseModel_1.default(course);
        const saveCourse = await newCOurse.save();
        return saveCourse.toObject();
    }
    // get category
    async getCategory() {
        const getData = await categoryModel_1.default.find({ is_listed: true });
        return getData;
    }
    async getInstructorCourses(id, limit, skip) {
        const getTutorCourses = await courseModel_1.default
            .find({ instructor_id: id })
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
        return getTutorCourses;
    }
    async coursesCount(id) {
        const counts = await courseModel_1.default.countDocuments({ instructor_id: id });
        return counts;
    }
    // lecture create
    async saveLectures(lecture) {
        const newLecture = new lectureModel_1.default(lecture);
        const saveLecture = newLecture.save();
        return (await saveLecture).toObject();
    }
    // module create
    async saveModules(module) {
        const newModule = new moduleModel_1.default(module);
        const saveModule = newModule.save();
        return (await saveModule).toObject();
    }
    // update course chapter array
    async saveModulesIdToChapter(course_id, modules_Id) {
        const findCourse = await courseModel_1.default.findByIdAndUpdate(course_id, { $push: { chapters: { $each: modules_Id } } }, { new: true, runValidators: true });
        return findCourse;
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
        return getTutorCourses;
    }
    // findConversationsByReceiverId
    async findConversationsByReceiverId(instructor_id) {
        const receiverConversations = await conversationModel_1.default
            .find({
            receiverId: instructor_id,
        })
            .sort({ updatedAt: -1 });
        return receiverConversations;
    }
    // instructorCourseData
    async instructorCourseData(instructor_id) {
        const courses = await courseModel_1.default.find({ instructor_id: instructor_id });
        const courseData = courses.map((course) => ({
            _id: course._id,
            courseName: course.title,
        }));
        return courseData;
    }
    // addAssignment
    async addAssignment(courseId, courseTitle, assignmentUrl) {
        const assigments = {
            courseId: courseId,
            pdf_file: assignmentUrl,
            title: courseTitle,
        };
        const newAssignment = new assignmentModel_1.default(assigments);
        const saveAssignment = await newAssignment.save();
        const updateCourse = await courseModel_1.default.findByIdAndUpdate(courseId, {
            $push: {
                assignments: saveAssignment._id,
            },
        }, { new: true });
        return !!saveAssignment._id && !!updateCourse;
    }
    // findAssignments
    async findAssignments(instructor_id) {
        // const instructorCourses: ICourseWithAssignments[] = await courseModel
        const instructorCourses = await courseModel_1.default
            .find({ instructor_id: instructor_id })
            .populate({
            path: "assignments",
            model: "Assignment",
            select: "title pdf_file courseId",
        })
            .lean();
        const assignments = instructorCourses.flatMap((course) => 
        // course.assignments?.map((assignment) => ({
        course.assignments?.map((assignment) => ({
            _id: assignment._id.toString(),
            title: assignment.title,
            pdf_file: assignment.pdf_file,
            courseId: assignment.courseId,
        })) || []);
        return assignments;
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
    // dashboard funtions
    async getTotalEarnings(instructorId) {
        const totalEarnings = await paymentModel_1.default.aggregate([
            { $match: { instructorID: instructorId } },
            { $group: { _id: null, total: { $sum: "$price" } } },
        ]);
        return totalEarnings[0]?.total || 0;
    }
    async getTotalStudents(instructorId) {
        const uniqueStudents = await paymentModel_1.default.distinct("userId", {
            instructorID: instructorId,
        });
        return uniqueStudents.length;
    }
    async getActiveCourses(instructorId) {
        return courseModel_1.default.countDocuments({
            instructor_id: instructorId,
            is_listed: false,
        });
    }
    async getRecentEnrollments(instructorId) {
        const pipeline = [
            {
                $match: {
                    instructorID: instructorId,
                },
            },
            {
                $group: {
                    _id: "$courseId",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
            {
                $limit: 4,
            },
            {
                $lookup: {
                    from: "courses",
                    // Convert string to ObjectId
                    let: { courseId: { $toObjectId: "$_id" } },
                    pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$courseId"] } } }],
                    as: "course",
                },
            },
            {
                $unwind: "$course",
            },
            {
                $project: {
                    title: "$course.title",
                    students: "$count",
                },
            },
        ];
        console.log(JSON.stringify(pipeline, null, 2), "pipeline");
        const recentEnrollments = await paymentModel_1.default.aggregate(pipeline);
        return recentEnrollments;
    }
    async getCoursePerformance(instructorId) {
        const courses = await courseModel_1.default.find({ instructor_id: instructorId });
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
    async getCourseGrowth(instructorId) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // -5 to include current month
        sixMonthsAgo.setDate(1); // Start from the 1st of the month
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const pipeline = [
            {
                $match: {
                    instructorID: instructorId,
                    createdAt: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        courseId: "$courseId",
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "courses",
                    let: { courseId: { $toObjectId: "$_id.courseId" } },
                    pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$courseId"] } } }],
                    as: "course",
                },
            },
            {
                $unwind: "$course",
            },
            {
                $project: {
                    _id: 0,
                    courseId: "$_id.courseId",
                    courseTitle: "$course.title",
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1,
                },
            },
        ];
        const result = await paymentModel_1.default.aggregate(pipeline);
        const courseTitles = [...new Set(result.map((item) => item.courseTitle))];
        // Generate all months in the last 6 months
        const allMonths = [];
        for (let i = 0; i < 6; i++) {
            const date = new Date(sixMonthsAgo);
            date.setMonth(date.getMonth() + i);
            allMonths.push({
                year: date.getFullYear(),
                month: date.getMonth() + 1,
            });
        }
        const dataMap = new Map(result.map((item) => [
            `${item.year}-${item.month}-${item.courseTitle}`,
            item.count,
        ]));
        const processedData = allMonths.map(({ year, month }) => {
            const monthData = {
                date: `${year}-${month.toString().padStart(2, "0")}`,
            };
            courseTitles.forEach((title) => {
                monthData[title] = dataMap.get(`${year}-${month}-${title}`) || 0;
            });
            return monthData;
        });
        return processedData;
    }
    // findByIdInstructorDetailsAndUpdate
    async findByIdInstructorDetailsAndUpdate(instructor_id, newImageUrl) {
        const result = (await tutorDetailsModel_1.default.findOneAndUpdate({ instructorId: instructor_id }, { $set: { profileImg: newImageUrl } }, { new: true }).exec());
        return result;
    }
    // store user Msg
    async storeMesssage(messages) {
        const newMessage = new messageModel_1.default(messages);
        const storeMsgs = await newMessage.save();
        return storeMsgs;
    }
    // createConversation
    async createConversation(lastMessage) {
        // Check if the conversation already exists in either direction (sender/receiver or receiver/sender)
        const conversationMsg = await conversationModel_1.default.findOne({
            $or: [
                { senderId: lastMessage.senderId, receiverId: lastMessage.receiverId },
                { senderId: lastMessage.receiverId, receiverId: lastMessage.senderId },
            ],
        });
        let lastConversation;
        if (conversationMsg) {
            // Update the existing conversation with the new last message sender name and instructor name
            await conversationModel_1.default.updateOne({
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
            });
            // Fetch the updated conversation
            lastConversation = await conversationModel_1.default.findOne({
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
            });
        }
        else {
            // Create a new conversation if  not exist
            const newConversation = new conversationModel_1.default(lastMessage);
            lastConversation = await newConversation.save();
        }
        return lastConversation;
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
    // changedPassword
    async changedPassword(instructorId, hashedNewPassword) {
        const result = await tutorModel_1.default.updateOne({ _id: instructorId }, { $set: { password: hashedNewPassword } });
        return result.modifiedCount > 0;
    }
}
exports.default = TutorRepository;
