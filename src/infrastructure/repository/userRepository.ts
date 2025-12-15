import User from "../../domain/user";
import userModel from "../database/userModels/userModel";
import otpDocModel from "../database/commonModel/otpDocModel";
import UserRepo from "../../useCase/Interface/userRepo";
import courseModel from "../database/tutorModel/courseModel";
import {
  AvgRating,
  IGetReviews,
  IInstructorDetails,
  IInstructorHomePage,
  IUpdateEditData,
  OtpDoc,
} from "../type/expressTypes";
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
import Report from "../database/commonModel/reportModal";
import categoryModel from "../database/adminModel/categoryModel";
import ICategory from "../../domain/Icategory";
import { IWallet } from "../../domain/wallet";
import walletModal from "../database/userModels/walletModal";

class UserRepository implements UserRepo {
  // saving user details to  database
  // async saves(user: User): Promise<User> {
  //   const newUser = new userModel(user);
  //   const saveUser = await newUser.save();
  //   return saveUser;
  // }

  async saves(user: any): Promise<User> {
  const newUser = new userModel(user);
  return await newUser.save();
}

  // email finding from DB
  async findByEmail(email: string): Promise<User | null> {
    const userData = await userModel.findOne({ email: email });
    return userData;
  }

  // find by id
  async findById(userId: string): Promise<User | null> {
    const userData = await userModel.findById(userId).exec();
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
  async getCourses(
    limit: number,
    skip: number,
    searchTerm: string,
    category: string
  ): Promise<{}[]> {
    let query: any = { is_verified: true };

    if (searchTerm) {
      query.title = { $regex: searchTerm, $options: "i" };
    }

    if (category) {
      const categoryObj = await categoryModel.findOne({
        categoryName: category,
      });
      if (categoryObj) {
        query.category_id = categoryObj._id;
      }
    }

    const coursesData = await courseModel
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

  async coursesCount(searchTerm: string, category: string): Promise<number> {
    let query: any = { is_verified: true };

    if (searchTerm) {
      query.title = { $regex: searchTerm, $options: "i" };
    }

    if (category) {
      const categoryObj = await categoryModel.findOne({
        categoryName: category,
      });
      if (categoryObj) {
        query.category_id = categoryObj._id;
      }
    }

    const counts = await courseModel.countDocuments(query);
    return counts;
  }

  // getCourseView
  async getCourseView(course_id: string, userid: string): Promise<any> {
    const paymentDocument = await Payment.findOne({
      userId: userid,
      courseId: course_id,
    }).lean();

    const wallet = await walletModal.findOne({ userId: userid });

    const hasPurchased = !!paymentDocument;

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

    return {
      getCourses: getViewCourses,
      isPurchased: hasPurchased,
      getWallet: wallet,
    };
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

    return savedPayment;
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
    // Check if the conversation already exists
    const conversationMsg = await conversationModel.findOne({
      $or: [
        { senderId: lastMessage.senderId, receiverId: lastMessage.receiverId },
        { senderId: lastMessage.receiverId, receiverId: lastMessage.senderId },
      ],
    });

    let lastConversation;

    if (conversationMsg) {
      // Update the existing conversation with the latest message and sender name
      lastConversation = await conversationModel.findOneAndUpdate(
        {
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
        },
        {
          $set: {
            senderName: lastMessage.senderName,
            instructorName: lastMessage.instructorName,
            lastMessage: lastMessage.lastMessage,
          },
        },
        { new: true }
      );
    } else {
      // Create a new conversation
      const newConversation = new conversationModel(lastMessage);
      lastConversation = await newConversation.save();
    }

    return lastConversation;
  }

  // upload reviews
  async uploadReview(data: reviews): Promise<boolean> {
    const newReview = new Review(data);
    const saveReview = await newReview.save();
    return !!saveReview;
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

    // console.log(tutor, instructor, "Fetched tutor and instructor details");
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
  // reportCourese
  async reportCourese(
    courseId: string,
    userId: string,
    issueType: string,
    description: string
  ): Promise<boolean> {
    try {
      const reportExist = await Report.findOne({ courseId });

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
      } else {
        const newReport = new Report({
          courseId,
          userId: [userId],
          issueType: [issueType],
          description: [description],
          reportedCount: 1,
        });

        await newReport.save();
      }

      return true;
    } catch (error) {
      console.error("Error reporting course:", error);
      return false;
    }
  }
  // userReportExist
  async userReportExist(courseId: string, userId: string): Promise<boolean> {
    const userExistReport = await Report.findOne({ courseId });
    if (userExistReport) {
      return userExistReport.userId.includes(userId);
    }
    return false;
  }
  // ratesGet
  async ratesGet(): Promise<AvgRating[]> {
    const ratings = await Review.aggregate([
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
  async saveEditData(
    userId: string,
    data: IUpdateEditData
  ): Promise<User | null> {
    const updatedUser = await userModel
      .findByIdAndUpdate(userId, { $set: data }, { new: true })
      .select("-password");

    return updatedUser;
  }
  // findUser
  async findUser(userId: string): Promise<User | null> {
    const user = await userModel.findById(userId);
    return user;
  }
  // changedPassword
  async changedPassword(
    userId: string,
    hashedNewPassword: string
  ): Promise<boolean> {
    const result = await userModel.updateOne(
      { _id: userId },
      { $set: { password: hashedNewPassword } }
    );

    return result.modifiedCount > 0;
  }

  // get category
  async getCategory(): Promise<ICategory[]> {
    const getData = await categoryModel.find({ is_listed: true });
    return getData;
  }
  // ratedCourseHome
  async ratedCourseHome(): Promise<AvgRating[]> {
    const ratings = await Review.aggregate([
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

  async findInstructorById(instructorId: string): Promise<IInstructorHomePage> {
    const name = await tutorModel.findById(instructorId);
    const details = await InstructorDetails.findOne({
      instructorId: instructorId,
    });

    const instructorData: IInstructorHomePage = {
      _id: name?._id as string,
      name: name?.name as string,
      instructorImg: details?.profileImg as string,
      position: details?.position as string,
    };

    return instructorData;
  }
  // entrolledUserExist
  async enrolledUserExist(userId: string): Promise<IPayment[] | null> {
    const existUser = await Payment.find({ userId: userId });
    return existUser;
  }
  // getMsgs
  async getMsgs(
    senderId: string,
    receiverId: string
  ): Promise<IMessage[] | null> {
    const senderIdMsgs = await Message.find({
      senderId: senderId,
      receiverId: receiverId,
    });
    const receiverIdMsgs = await Message.find({
      senderId: receiverId,
      receiverId: senderId,
    });
    const allMessages = [...senderIdMsgs, ...receiverIdMsgs];

    allMessages.sort((a: IMessage, b: IMessage) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
    return allMessages.length ? allMessages : null;
  }
  // walletDatas
  async walletDatas(userId: string): Promise<IWallet | null> {
    const getWallet = await walletModal.findOne({ userId: userId });
    return getWallet;
  }
  // saveWalletPayment
  async saveWalletPayment(payment: IPayment): Promise<IPayment> {
    const newPayment = new Payment(payment);
    const savedPayment = await newPayment.save();
    return savedPayment;
  }
  // updateWallet
  async updateWallet(
    userId: string,
    price: number,
    courseName: string
  ): Promise<boolean> {
    const updateResult = await walletModal.updateOne(
      { userId: userId },
      {
        $inc: { balance: -price },
        $push: {
          history: {
            type: "Debit",
            amount: price,
            reason: `Purchased the ${courseName} using wallet cash`,
            date: new Date(),
          },
        },
      }
    );

    return updateResult.modifiedCount > 0;
  }
}

export default UserRepository;
