import Tutor from "../../domain/tutor";
import TutorRepo from "../../useCase/Interface/tutorRepo";
import tutorModel from "../database/tutorModel/tutorModel";
import OtpDocModel from "../database/commonModel/otpDocModel";
import courseModel from "../database/tutorModel/courseModel";
import ICourse from "../../domain/course/course";
import { ObjectId } from "mongodb";
import { PipelineStage } from "mongoose";
import ICategory from "../../domain/Icategory";
import categoryModel from "../database/adminModel/categoryModel";
import Lecture from "../../domain/course/lecture";
import lectureModel from "../database/tutorModel/lectureModel";
import Modules from "../../domain/course/chapter";
import moduleModel from "../database/tutorModel/moduleModel";
import {
  CourseData,
  IAssignment,
  IConversation,
  ICourseWithAssignments,
  IGetReviews,
  IInstructorDetails,
  InstructorDashboardData,
  OtpDoc,
  TutorDetails,
} from "../type/expressTypes";
import { ITutorDetails } from "../../domain/tutorDetails";
import InstructorDetails from "../database/tutorModel/tutorDetailsModel";
import conversationModel from "../database/commonModel/conversationModel";
import { Assignment } from "../../domain/course/assignment";
import assignmentModel from "../database/tutorModel/assignmentModel";
import Review from "../database/commonModel/reviewModel";
import mongoose from "mongoose";
import Payment from "../database/commonModel/paymentModel";
import { IMessage } from "../../domain/message";
import Message from "../database/commonModel/messageModel";
import { Conversation } from "../../domain/conversationMsg";

class TutorRepository implements TutorRepo {
  //save tutor to DB
  async saves(tutor: Tutor): Promise<Tutor> {
    const newTutor = new tutorModel(tutor);
    const saveTutor = await newTutor.save();
    // console.log(saveTutor, "_id kittiyo");

    return saveTutor;
  }

  // email finding from DB
  async findByEmail(email: string): Promise<Tutor | null> {
    const res = await tutorModel.findOne({ email: email });
    return res;
  }

  // find by id
  async findById(tutorId: string): Promise<Tutor | null> {
    const tutorData = await tutorModel.findById({ _id: tutorId });
    // console.log(tutorData, "find by id");
    return tutorData;
  }
  // Instructor Details uploading
  async uploadInstructorDetails(
    details: ITutorDetails
  ): Promise<ITutorDetails> {
    const newDetailInstrucotr = new InstructorDetails(details);
    const saveDetails = await newDetailInstrucotr.save();
    console.log(saveDetails, "saveDetails");
    return saveDetails;
  }
  // instructor details document checking
  async instructorDetailsExistId(
    instructor_id: string
  ): Promise<ITutorDetails | null> {
    const instructorData = await InstructorDetails.findOne({
      instructorId: instructor_id,
    });
    return instructorData;
  }
  // register data update
  async updateTheRegister(registerData: Tutor): Promise<boolean> {
    const { _id, ...updateFields } = registerData;
    if (!_id) {
      throw new Error("ID is required for updating the user data");
    }
    const result = await tutorModel.updateOne({ _id }, { $set: updateFields });

    return result.modifiedCount > 0;
  }
  // updateTheInstructorDetails
  async updateTheInstructorDetails(
    instructorDetail: TutorDetails
  ): Promise<boolean> {
    const { _id, ...updateFields } = instructorDetail;

    if (!_id) {
      throw new Error("ID is required for updating the user data");
    }
    const result = await InstructorDetails.updateOne(
      { _id },
      { $set: updateFields }
    );

    return result.modifiedCount > 0;
  }

  // otp taking from db
  async saveOtp(
    name: string,
    email: string,
    otp: number,
    role: string
  ): Promise<{}> {
    const newOtpDoc = new OtpDocModel({
      name: name,
      email: email,
      otp: otp,
      role: role,
      generatedAt: new Date(),
    });
    const saveOtp = await newOtpDoc.save();
    // console.log(saveOtp, "tutor otp data");

    return saveOtp;
  }

  async findOtpByEmail(email: string, role: string): Promise<OtpDoc | null> {
    const otpData = await OtpDocModel.findOne({
      email: email,
      role: role,
    }).sort({ generatedAt: -1 });
    console.log(otpData, "repo otp data..........................");
    return otpData;
  }

  async forgotPassUpdate(
    email: string,
    hashPassword: string
  ): Promise<boolean> {
    const result = await tutorModel.updateOne(
      { email: email },
      { $set: { password: hashPassword } }
    );
    return result.modifiedCount > 0;
  }

  // course creation
  async createCourse(course: ICourse): Promise<ICourse> {
    const newCOurse = new courseModel(course);
    const saveCourse = await newCOurse.save();
    console.log(saveCourse, "repo save course");
    return saveCourse.toObject() as unknown as ICourse;
  }
  // get category*******************
  async getCategory(): Promise<ICategory[]> {
    const getData = await categoryModel.find({ is_listed: true });
    return getData;
  }

  async getInstructorCourses(
    id: string,
    limit: number,
    skip: number
  ): Promise<{}[]> {
    const getTutorCourses = await courseModel
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
    // console.dir(getTutorCourses, { depth: null, colors: true });

    return getTutorCourses;
  }
  async coursesCount(id: string): Promise<number> {
    const counts = await courseModel.countDocuments({ instructor_id: id });
    console.log(`Count of documents for ID ${id}:`, counts);
    return counts;
  }
  // lecture create
  async saveLectures(lecture: Lecture): Promise<Lecture> {
    const newLecture = new lectureModel(lecture);
    const saveLecture = newLecture.save();
    console.log(saveLecture, "lecture saved");

    return (await saveLecture).toObject() as unknown as Lecture;
  }
  // module create
  async saveModules(module: Modules): Promise<Modules> {
    const newModule = new moduleModel(module);
    const saveModule = newModule.save();

    console.log(saveModule, "module save");
    return (await saveModule).toObject() as unknown as Modules;
  }
  // update course chapter array
  async saveModulesIdToChapter(
    course_id: string,
    modules_Id: {}[]
  ): Promise<any> {
    const findCourse = await courseModel.findByIdAndUpdate(
      course_id,
      { $push: { chapters: { $each: modules_Id } } },
      { new: true, runValidators: true }
    );
    console.log(findCourse, "module ids are added to chapter");

    return findCourse;
  }
  // getCourseView
  async getCourseView(course_id: string): Promise<any> {
    const getTutorCourses = await courseModel
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
  // findConversationsByReceiverId
  async findConversationsByReceiverId(
    instructor_id: string
  ): Promise<IConversation[]> {
    const receiverConversations = await conversationModel.find({
      receiverId: instructor_id,
    }).sort({updatedAt:-1});
    return receiverConversations;
  }
  // instructorCourseData
  async instructorCourseData(instructor_id: string): Promise<CourseData[]> {
    const courses = await courseModel.find({ instructor_id: instructor_id });
    const courseData: CourseData[] = courses.map((course) => ({
      _id: course._id as string,
      courseName: course.title,
    }));
    return courseData;
  }
  // addAssignment
  async addAssignment(
    courseId: string,
    courseTitle: string,
    assignmentUrl: string
  ): Promise<boolean> {
    const assigments: Assignment = {
      courseId: courseId,
      pdf_file: assignmentUrl,
      title: courseTitle,
    };
    const newAssignment = new assignmentModel(assigments);
    const saveAssignment = await newAssignment.save();
    console.log(saveAssignment, "saveAssignment");
    const updateCourse = await courseModel.findByIdAndUpdate(
      courseId,
      {
        $push: {
          assignments: saveAssignment._id,
        },
      },
      { new: true }
    );
    return !!saveAssignment._id && !!updateCourse;
  }

  // findAssignments
  async findAssignments(instructor_id: string): Promise<IAssignment[]> {
    const instructorCourses: ICourseWithAssignments[] = await courseModel
      .find({ instructor_id: instructor_id })
      .populate({
        path: "assignments",
        model: "Assignment",
        select: "title pdf_file courseId",
      })
      .lean();

    const assignments: IAssignment[] = instructorCourses.flatMap(
      (course) =>
        course.assignments?.map((assignment) => ({
          _id: assignment._id.toString(),
          title: assignment.title,
          pdf_file: assignment.pdf_file,
          courseId: assignment.courseId,
        })) || []
    );
    return assignments;
  }

  // getReview
  async getReview(courseId: string): Promise<IGetReviews[]> {
    const reviews = await Review.find({ courseId: courseId }).sort({
      createdAt: -1,
    });
    console.log(reviews, "getReview");
    const reviewData: IGetReviews[] = reviews.map((review) => ({
      userName: review.userName,
      feedback: review.feedback,
      rating: review.rating,
    }));

    console.log(reviewData, "data reiew");

    return reviewData;
  }
  // fetchAssignments
  async fetchAssignments(courseId: string): Promise<Assignment[]> {
    const assigmentsData = await assignmentModel.find({ courseId: courseId });
    return assigmentsData;
  }
  // fetchInstructor
  async fetchInstructor(instructorId: string): Promise<IInstructorDetails> {
    const tutor = await tutorModel.findById(instructorId);
    const instructor = await InstructorDetails.findOne({
      instructorId: instructorId,
    });

    console.log(tutor, instructor, "Fetched tutor and instructor details");
    const instructor_id = tutor?._id as string;
    const instructorname = tutor?.name as string;
    const instructormail = tutor?.email as string;
    const instructorData: IInstructorDetails = {
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
  async getTotalEarnings(instructorId: string): Promise<number> {
    const totalEarnings = await Payment.aggregate([
      { $match: { instructorID: instructorId } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    return totalEarnings[0]?.total || 0;
  }

  async getTotalStudents(instructorId: string): Promise<number> {
    const uniqueStudents = await Payment.distinct("userId", {
      instructorID: instructorId,
    });
    return uniqueStudents.length;
  }

  async getActiveCourses(instructorId: string): Promise<number> {
    return courseModel.countDocuments({
      instructor_id: instructorId,
      is_listed: false,
    });
  }

  async getRecentEnrollments(instructorId: string): Promise<any[]> {
    const pipeline: PipelineStage[] = [
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

    const recentEnrollments = await Payment.aggregate(pipeline);
    console.log("Final result:", recentEnrollments);

    return recentEnrollments;
  }

  async getCoursePerformance(instructorId: string): Promise<any[]> {
    const courses = await courseModel.find({ instructor_id: instructorId });
    console.log(courses, "courses");

    const courseIds = courses.map((course) => String(course._id));
    console.log(courseIds, "courseIds");

    const ratings = await Review.aggregate([
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

    console.log(ratings, "Ratings Data");

    return courses.map((course) => ({
      title: course.title,
      rating: ratings.find((r) => r._id == course._id)?.averageRating || 1,
    }));
  }

  async getCourseGrowth(instructorId: string): Promise<any[]> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // -5 to include current month
    sixMonthsAgo.setDate(1); // Start from the 1st of the month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const pipeline: PipelineStage[] = [
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

    const result = await Payment.aggregate(pipeline);

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

    const dataMap = new Map(
      result.map((item) => [
        `${item.year}-${item.month}-${item.courseTitle}`,
        item.count,
      ])
    );

    const processedData = allMonths.map(({ year, month }) => {
      const monthData: any = {
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
  async findByIdInstructorDetailsAndUpdate(
    instructor_id: string,
    newImageUrl: string
  ): Promise<TutorDetails | null> {
    const result = (await InstructorDetails.findOneAndUpdate(
      { instructorId: instructor_id },
      { $set: { profileImg: newImageUrl } },
      { new: true }
    ).exec()) as TutorDetails | null;

    return result;
  }
  // store user Msg
  async storeMesssage(messages: IMessage): Promise<IMessage> {
    const newMessage = new Message(messages);
    const storeMsgs = await newMessage.save();
    return storeMsgs;
  }
  // createConversation
  async createConversation(
    lastMessage: Conversation
  ): Promise<Conversation | null> {
    const conversationMsg = await conversationModel.findOne({
      senderId: lastMessage.senderId,
      receiverId: lastMessage.receiverId,
    });

    const hasConverstion = !!conversationMsg;
    let lastConverstion;
    if (hasConverstion) {
      const converstion = await conversationModel.updateOne(
        { senderId: lastMessage.senderId, receiverId: lastMessage.receiverId },
        { $set: { lastMessage: lastMessage.lastMessage } }
      );
      lastConverstion = await conversationModel.findOne({
        senderId: lastMessage.senderId,
        receiverId: lastMessage.receiverId,
      });
    } else {
      let newConversation = new conversationModel(lastMessage);
      let saveConversation = await newConversation.save();
      lastConverstion = saveConversation;
    }

    return lastConverstion;
  }
  // getMsgs
  async getMsgs(senderId: string, receiverId: string): Promise<IMessage[] | null> {
    const senderIdMsgs = await Message.find({senderId:senderId,receiverId:receiverId})
    const receiverIdMsgs = await Message.find({senderId:receiverId,receiverId:senderId})
    const allMessages = [...senderIdMsgs, ...receiverIdMsgs];

    allMessages.sort((a: IMessage, b: IMessage) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
    return allMessages.length ? allMessages : null;
  }
}

export default TutorRepository;
