import { Request, Response, NextFunction } from "express";

// Exportings types like Request, Response,Next
export type Req = Request;
export type Res = Response;
export type Next = NextFunction;

export interface Obj {
  cateName: string;
}

export interface courseInfo {
  title: string;
  description: string;
  instructor_id: string;
  category: string;
  price: string;
}

export interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  type?: string;
}

import mongoose, { Types } from "mongoose";
import { Assignment } from "../../domain/course/assignment";
import Modules from "../../domain/course/chapter";

export interface IExtractCourse {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  instructor_id: Types.ObjectId | string;
  category_id: {
    _id: Types.ObjectId;
    categoryName: string;
  };
  price: string;
  thambnail_Img: string;
  trailer_vd: string;
  chapters?: {
    _id: Types.ObjectId;
    name: string;
    lectures: {
      _id: Types.ObjectId;
      title: string;
      description: string;
      video: string;
      pdf: string;
      createdAt: Date;
    }[];
    createdAt: Date;
  }[];
  assigments?: Assignment[];
  is_verified?: boolean;
  is_listed?: boolean;
  createdAt?: Date;
}

export interface OtpDoc {
  name?: string;
  email: string;
  otp: string;
  role: string;
  generatedAt?: Date;
}

export interface IPaymentComplete {
  res: {};
  courseID: string;
  userID: string;
  instructorId: string;
}

export interface InterCourse {
  _id?: string;
  title: string;
  description: string;
  instructor_id: string;
  category_id: string;
  price: string | number | undefined;
  thambnail_Img: string;
  trailer_vd: string;
  chapters?: Modules[];
  assigments?: Assignment[];
  is_verified?: boolean;
  is_listed?: boolean;
  createdAt?: Date;
}

export interface TutorDetails {
  _id?: string;
  instructorId: string;
  profileImg?: string;
  experience?: string;
  position?: string;
  companyName?: string;
  aboutBio?: string;
}

export type itemsCount = number;

export interface Message {
  _id?: string;
  senderId: string;
  receiverId: string;
  message: string;
  timeStamp?: Date;
}

export interface IConversation {
  senderName: string;
  senderId: string;
  receiverId: string;
  lastMessage: string;
  timeStamp?: Date;
}

export interface IAssignment {
  _id?: string;
  title: string;
  pdf_file: string;
  courseId: string;
}

export interface CourseData {
  _id: string;
  courseName: string;
}

export interface ICourseWithAssignments {
  _id: string;
  title: string;
  assignments?: Array<{
    _id: mongoose.Types.ObjectId;
    title: string;
    pdf_file: string;
    courseId: string;
  }>;
}

export interface IGetReviews {
  userName?: string;
  feedback: string;
  rating: number;
}

export interface IInstructorDetails {
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  profileImg?: string;
  experience?: string;
  position?: string;
  companyName?: string;
  aboutBio?: string;
}

export interface IReportIssues {
  issueType: string;
  description: string;
}

export interface IReportRequest {
  courseId: string;
  userId: string[];
  issuesType: string[];
  descriptiion: string[];
}

export interface IReportedCourseData {
  courseId: string;
  courseName: string;
  instructorId: string;
  thamnail: string;
}
export interface IReportInstructor {
  instructorName: string;
  email: string;
}

export interface AvgRating {
  _id: string;
  title: string;
  averageRating: number;
  totalReviews: number;
}

// dashbboard data
export interface InstructorDashboardData {
  totalEarnings: number;
  totalStudents: number;
  totalCourses: number;
  allCoursesCount: number;
  listedCoursesCount: number;
  bestCourse: {
    _id: string;
    title: string;
    totalEarnings: number;
    studentsCount: number;
    averageRating: number;
    reviewsCount: number;
  } | null;
  coursePerformance: Array<{
    _id: string;
    title: string;
    totalEarnings: number;
    studentsCount: number;
    averageRating: number;
    reviewsCount: number;
  }>;
}

export interface DashboardData {
  totalEarnings: number;
  listedCourses: number;
  totalStudents: number;
}

export interface IUpdateEditData {
  name?: string;
  email?: string;
  phone?: string;
  img?: string | undefined;
}

export interface IInstructorHomePage {
  _id: string;
  instructorImg: string;
  profileUrl?: string;
  name: string;
  position: string;
}

export interface IUpdateTutor {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  isBlocked?: boolean;
  isAdmin?: boolean;
  isGoogle?: boolean;
}
