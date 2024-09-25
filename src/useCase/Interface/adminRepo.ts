import User from "../../domain/user";
import Tutor from "../../domain/tutor";
import ICategory from "../../domain/Icategory";
import ICourse from "../../domain/course/course";
import {
  AvgRating,
  IGetReviews,
  IInstructorDetails,
  IReportedCourseData,
  IReportInstructor,
} from "../../infrastructure/type/expressTypes";
import { Assignment } from "../../domain/course/assignment";
import { IReport } from "../../domain/report";
import { IWallet } from "../../domain/wallet";

interface AdminRep {
  // users taking
  findUsers(
    page: number,
    limit: number
  ): Promise<{ users: User[]; totalUsers: number }>;
  blockUser(userID: string): Promise<boolean>;
  unblockUser(userID: string): Promise<boolean>;
  // tutors taking
  findTutors(
    page: number,
    limit: number
  ): Promise<{ tutors: Tutor[]; totalTutors: number }>;
  blockTutor(tutorID: string): Promise<boolean>;
  unblockTutor(userID: string): Promise<boolean>;
  // category repo ts
  createCategory(
    category: ICategory
  ): Promise<{ success: boolean; reason: string }>;
  findCategory(
    page: number,
    limit: number
  ): Promise<{ categories: ICategory[]; totalCategory: number }>;
  UpdateCategory(
    newCategory: string,
    category_id: string
  ): Promise<{ success: boolean; reason: string }>;
  getCourses(page: number, limit: number): Promise<{}[]>;
  coursesCount(id: string): Promise<number>;
  findUnapprovedCourse(): Promise<any>;
  verifyCourse(courseId: string): Promise<boolean>;
  unverifyCourse(courseId: string): Promise<boolean>;
  getReview(courseId: string): Promise<IGetReviews[]>;
  fetchAssignments(courseId: string): Promise<Assignment[]>;
  fetchInstructor(instructorId: string): Promise<IInstructorDetails>;
  reportsFetch():Promise<IReport[]>;
  findCourseById(course_id:string):Promise<IReportedCourseData>;
  findInstructorById(instructorId:string):Promise<IReportInstructor>;
  courseDelete(courseId:string):Promise<boolean>;
  deleteReport(courseId:string):Promise<boolean>;
  ratesGet():Promise<AvgRating[]>;
  refundUserAmt(course_id:string, courseName:string):Promise<boolean>;
  deletePayments(course_id:string):Promise<boolean>;
 
}

export default AdminRep;
