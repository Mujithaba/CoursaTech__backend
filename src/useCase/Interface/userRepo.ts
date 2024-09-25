import { Conversation } from "../../domain/conversationMsg";
import { Assignment } from "../../domain/course/assignment";
import ICourse from "../../domain/course/course";
import ICategory from "../../domain/Icategory";
import { IMessage } from "../../domain/message";
import { IPayment } from "../../domain/payment";
import { reviews } from "../../domain/review";
import User from "../../domain/user";
import { IWallet } from "../../domain/wallet";
import {
  AvgRating,
  IGetReviews,
  IInstructorDetails,
  IInstructorHomePage,
  IUpdateEditData,
  OtpDoc,
} from "../../infrastructure/type/expressTypes";

interface UserRepo {
  saves(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(userId: string): Promise<User | null>;
  saveOtp(
    name: string,
    email: string,
    otp: number,
    user: string
  ): Promise<OtpDoc>;
  findOtpByEmail(email: string, role: string): Promise<OtpDoc | null>;
  forgotPassUpdate(email: string, password: string): Promise<boolean>;
  getCourses(
    limit: number,
    skip: number,
    searchTerm: string,
    category: string
  ): Promise<{}[]>;
  coursesCount(searchTerm: string, category: string): Promise<number>;
  getCourseView(course_id: string, userid: string): Promise<any>;
  findCourseById(course_id: string): Promise<ICourse | null>;
  savePayments(payment: IPayment): Promise<IPayment>;
  storeMesssage(messages: IMessage): Promise<IMessage>;
  createConversation(lastMessage: Conversation): Promise<Conversation | null>;
  uploadReview(data: reviews): Promise<boolean>;
  getReview(courseId: string): Promise<IGetReviews[]>;
  fetchAssignments(courseId: string): Promise<Assignment[]>;
  fetchInstructor(instructorId: string): Promise<IInstructorDetails>;
  reportCourese(
    courseId: string,
    userId: string,
    issueType: string,
    description: string
  ): Promise<boolean>;
  userReportExist(courseId: string, userId: string): Promise<boolean>;
  ratesGet(): Promise<AvgRating[]>;
  saveEditData(userId: string, data: IUpdateEditData): Promise<User | null>;
  findUser(userId: string): Promise<User | null>;
  changedPassword(userid: string, updatePassword: string): Promise<boolean>;
  getCategory(): Promise<ICategory[]>;
  ratedCourseHome(): Promise<AvgRating[]>;
  findInstructorById(instructorId: string): Promise<IInstructorHomePage>;
  enrolledUserExist(userId: string): Promise<IPayment[] | null>;
  getMsgs(senderId: string, receiverId: string): Promise<IMessage[] | null>;
  walletDatas(userId: string): Promise<IWallet | null>;
  saveWalletPayment(payment: IPayment): Promise<IPayment>;
  updateWallet(userId:string,price:number,courseName:string):Promise<boolean>
}

export default UserRepo;
