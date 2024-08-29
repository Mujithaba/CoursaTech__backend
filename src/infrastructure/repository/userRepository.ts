import User from "../../domain/user";
// import IOtpDoc from "../../domain/IOtpDoc";
import userModel from "../database/userModels/userModel";
import otpDocModel from "../database/commonModel/otpDocModel";
import UserRepo from "../../useCase/Interface/userRepo";
import { log } from "console";
import courseModel from "../database/tutorModel/courseModel";
import { IAssignment, IGetReviews, IInstructorDetails, itemsCount, OtpDoc } from "../type/expressTypes";
import ICourse from "../../domain/course/course";
import { IPayment } from "../../domain/payment";
import Payment from "../database/commonModel/paymentModel";
import { IMessage } from "../../domain/message";
import Message from "../database/commonModel/messageModel";
import { Conversation } from "../../domain/conversationMsg";
import conversationModel from "../database/commonModel/conversationModel";
import { reviews } from "../../domain/review";
import Review from "../database/commonModel/reviewModel";
import assignmentModel from "../database/tutorModel/assignmentModel";
import { Assignment } from "../../domain/course/assignment";
import InstructorDetails from "../database/tutorModel/tutorDetailsModel";
import tutorModel from "../database/tutorModel/tutorModel";

class UserRepository implements UserRepo {
  // saving user details to  database
  async saves(user: User): Promise<User> {
    const newUser = new userModel(user);
    const saveUser = await newUser.save();
    return saveUser;
  }

  // email finding from DB
  async findByEmail(email: string): Promise<User | null> {
    const userData = await userModel.findOne({ email: email });
    return userData;
  }

  // find by id
  async findById(userId: string): Promise<User | null> {
    const userData = await userModel.findById({ _id: userId });
    console.log(userData, "find by id");
    return userData;
  }

  // otp details saving in db using TTL  --- change otp doc ts in promise--
  async saveOtp(
    name: string,
    email: string,
    otp: number,
    role: string
  ): Promise<OtpDoc> {
    const newOtpDoc = new otpDocModel({
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
  async findOtpByEmail(email: string, role: string): Promise<OtpDoc | null> {
    const otpData = await otpDocModel
      .findOne({ email: email, role: role })
      .sort({ generatedAt: -1 });
    return otpData;
  }

  async forgotPassUpdate(
    email: string,
    hashPassword: string
  ): Promise<boolean> {
    const result = await userModel.updateOne(
      { email: email },
      { $set: { password: hashPassword } }
    );
    return result.modifiedCount > 0;
  }

  // get all course
  async getCourses(limit: number, skip: number): Promise<{}[]> {
    const coursesData = await courseModel
      .find({is_verified:true})
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

  async coursesCount(): Promise<number> {
    const counts = await courseModel.countDocuments({is_verified:true});
    return counts;
  }

  

  // getCourseView
  async getCourseView(course_id: string, userid: string): Promise<any> {
    const paymentDocument = await Payment.findOne({
      userId: userid,
      courseId: course_id,
    }).lean();

    const hasPurchased = !!paymentDocument;
    console.log(hasPurchased, "is__________________");

    const getViewCourses = await courseModel
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
    // console.dir(getViewCourses, { depth: null, colors: true });

    return { getCourses: getViewCourses, isPurchased: hasPurchased };
  }

  // find course
  async findCourseById(course_id: string): Promise<ICourse | null> {
    const course = await courseModel.findById(course_id);
    return course?.toObject() as unknown as ICourse;
  }

  // savePayments
  async savePayments(payment: IPayment): Promise<IPayment> {
    const newPayment = new Payment(payment);
    const savedPayment = await newPayment.save();
    console.log(savedPayment, "saved payment");

    return savedPayment;
  }

  // store user Msg
  async storeMesssage(messages: IMessage): Promise<IMessage> {
    const newMessage = new Message(messages);
    const storeMsgs = await newMessage.save();
    return storeMsgs;
  }
  // createConversation
  async createConversation(lastMessage: Conversation): Promise<Conversation |null> {
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
  async uploadReview(data: reviews): Promise<boolean> {
    const newReview = new Review(data);
    const saveReview = await newReview.save();
    return !!saveReview
  }
  // getReview
  async getReview(courseId: string): Promise<IGetReviews[]> {
    const reviews = await Review.find({courseId:courseId}).sort({createdAt:-1});
    console.log(reviews,"getReview");
   const reviewData:IGetReviews[] =reviews.map((review)=>({
    userName:review.userName,
    feedback:review.feedback,
    rating:review.rating
   }))
    
   console.log(reviewData,"data reiew");
   
   return reviewData
  }
  // fetchAssignments
  async fetchAssignments(courseId: string): Promise<Assignment[]> {
    const assigmentsData = await assignmentModel.find({courseId:courseId})
    return assigmentsData

  }
  // fetchInstructor
  async fetchInstructor(instructorId: string): Promise<IInstructorDetails> {
    const tutor = await tutorModel.findById(instructorId)
    const instructor = await InstructorDetails.findOne({ instructorId: instructorId });

    console.log(tutor, instructor, "Fetched tutor and instructor details");
    const instructor_id = tutor?._id as string
    const instructorname = tutor?.name as string
    const instructormail = tutor?.email as string
    const instructorData: IInstructorDetails = {
      instructorId: instructor_id,
      instructorName: instructorname,
      instructorEmail:instructormail,
      aboutBio: instructor?.aboutBio || '',
      companyName: instructor?.companyName || '',
      experience: instructor?.experience || '',
      position: instructor?.position || '',
      profileImg: instructor?.profileImg || ''
    };

    return instructorData;
  }
}

export default UserRepository;
