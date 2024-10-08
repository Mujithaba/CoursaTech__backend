import Tutor from "../../domain/tutor";
import User from "../../domain/user";
import AdminRep from "../../useCase/Interface/adminRepo";
import tutorModel from "../database/tutorModel/tutorModel";
import userModel from "../database/userModels/userModel";
import ICategory from "../../domain/Icategory";
import categoryModel from "../database/adminModel/categoryModel";
import courseModel from "../database/tutorModel/courseModel";
import { PipelineStage } from "mongoose";
import {
  AvgRating,
  IGetReviews,
  IInstructorDetails,
  IReportedCourseData,
  IReportInstructor,
} from "../type/expressTypes";
import InstructorDetails from "../database/tutorModel/tutorDetailsModel";
import assignmentModel from "../database/tutorModel/assignmentModel";
import { Assignment } from "../../domain/course/assignment";
import Review from "../database/commonModel/reviewModel";
import { IReport } from "../../domain/report";
import Report from "../database/commonModel/reportModal";
import Payment from "../database/commonModel/paymentModel";
import { log } from "console";
import walletModal from "../database/userModels/walletModal";
import { IWallet } from "../../domain/wallet";

class AdminRepository implements AdminRep {
  async findUsers(
    page: number,
    limit: number
  ): Promise<{ users: User[]; totalUsers: number }> {
    const totalUsers = await userModel.countDocuments({ isAdmin: false });
    const users = await userModel
      .find({ isAdmin: false })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit);
    return { users, totalUsers };
  }

  // block user
  async blockUser(userID: string): Promise<boolean> {
    const result = await userModel.updateOne(
      { _id: userID },
      { $set: { isBlocked: true } }
    );
    return result.modifiedCount > 0;
  }

  // unblock user
  async unblockUser(userID: string): Promise<boolean> {
    const result = await userModel.updateOne(
      { _id: userID },
      { $set: { isBlocked: false } }
    );
    return result.modifiedCount > 0;
  }

  // taking all tutors from db
  async findTutors(
    page: number,
    limit: number
  ): Promise<{ tutors: Tutor[]; totalTutors: number }> {
    const totalTutors = await tutorModel.countDocuments();
    const tutors = await tutorModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);
    return { tutors, totalTutors };
  }

  // block user
  async blockTutor(tutorID: string): Promise<boolean> {
    const result = await tutorModel.updateOne(
      { _id: tutorID },
      { $set: { isBlocked: true } }
    );
    return result.modifiedCount > 0;
  }

  // unblock user
  async unblockTutor(tutorID: string): Promise<boolean> {
    const result = await tutorModel.updateOne(
      { _id: tutorID },
      { $set: { isBlocked: false } }
    );
    return result.modifiedCount > 0;
  }

  // category save
  async createCategory(
    category: ICategory
  ): Promise<{ success: boolean; reason: string }> {
    category.categoryName = category.categoryName.trim();

    const newCategoryLower = category.categoryName.toLowerCase();
    const existCategory = await categoryModel.findOne({
      categoryName: new RegExp(`^${newCategoryLower}$`, "i"),
    });
    if (existCategory) {
      return { success: false, reason: "The category already exists" };
    }

    const newCategory = new categoryModel(category);
    const saveCategory = await newCategory.save();
    return { success: true, reason: "Category added successfully" };
  }
  // category get
  async findCategory(
    page: number,
    limit: number
  ): Promise<{ categories: ICategory[]; totalCategory: number }> {
    const totalCategory = await categoryModel.countDocuments();
    const categories = await categoryModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);
    return { categories, totalCategory };
  }

  // unlist category
  async unlistCategory(categoryId: string): Promise<boolean> {
    const result = await categoryModel.updateOne(
      { _id: categoryId },
      { $set: { is_listed: false } }
    );
    return result.modifiedCount > 0;
  }
  // listed category
  async listCategory(categoryId: string): Promise<boolean> {
    const result = await categoryModel.updateOne(
      { _id: categoryId },
      { $set: { is_listed: true } }
    );
    return result.modifiedCount > 0;
  }
  // edit Category
  async UpdateCategory(
    newCategory: string,
    category_id: string
  ): Promise<{ success: boolean; reason: string }> {
    newCategory = newCategory.trim();

    const newCategoryLower = newCategory.toLowerCase();
    const existCategory = await categoryModel.findOne({
      _id: { $ne: category_id },
      categoryName: new RegExp(`^${newCategoryLower}$`, "i"),
    });
    if (existCategory) {
      return { success: false, reason: "The category already exists" };
    }
    const result = await categoryModel.updateOne(
      { _id: category_id },
      { $set: { categoryName: newCategory } }
    );
    return {
      success: result.modifiedCount > 0,
      reason: result.modifiedCount > 0 ? "" : "Failed to update category",
    };
  }
  // get all course
  async getCourses(limit: number, skip: number): Promise<{}[]> {
    const coursesData = await courseModel
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
  async coursesCount(): Promise<number> {
    const counts = await courseModel.countDocuments();
    return counts;
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
  // course approvel
  async findUnapprovedCourse(): Promise<any> {
    const totalUnverify = await courseModel.countDocuments({
      is_verified: false,
    });

    const getCourses = await courseModel
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
  async verifyCourse(courseId: string): Promise<boolean> {
    const result = await courseModel.updateOne(
      { _id: courseId },
      { $set: { is_verified: true } }
    );
    return result.modifiedCount > 0;
  }
  // unverifyCourse
  async unverifyCourse(courseId: string): Promise<boolean> {
    const result = await courseModel.updateOne(
      { _id: courseId },
      { $set: { is_verified: false } }
    );
    return result.modifiedCount > 0;
  }

  // getReview
  async getReview(courseId: string): Promise<IGetReviews[]> {
    const reviews = await Review.find({ courseId: courseId }).sort({
      createdAt: -1,
    });
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

  // reportsFetch
  async reportsFetch(): Promise<IReport[]> {
    const reports = await Report.find();
    return reports;
  }
  // findCourse for report course data
  async findCourseById(course_id: string): Promise<IReportedCourseData> {
    const courseData = await courseModel.findById(course_id);
    const instructorId = String(courseData?.instructor_id);
    let course: IReportedCourseData = {
      courseId: courseData?._id as string,
      courseName: courseData?.title as string,
      instructorId: instructorId,
      thamnail: courseData?.thambnail_Img as string,
    };
    return course;
  }
  // findInstructor for report course
  async findInstructorById(instructorId: string): Promise<IReportInstructor> {
    const instructorData = await tutorModel.findById(instructorId);
    let instructor: IReportInstructor = {
      instructorName: instructorData?.name as string,
      email: instructorData?.email as string,
    };
    return instructor;
  }
  // refundUserAmt
  async refundUserAmt(course_id: string, courseName: string): Promise<boolean> {
    try {
      const coursePaymentData = await Payment.find({ courseId: course_id });
      const refundPromises = coursePaymentData.map(async (refund) => {
        const existWallet = await walletModal.findOne({
          userId: refund.userId,
        });

        if (!existWallet) {
          const data: IWallet = {
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
          const newWallet = new walletModal(data);
          await newWallet.save();
        } else {
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
    } catch (error) {
      console.error("Error processing refunds:", error);
      return false;
    }
  }
  // courseDelete
  async courseDelete(courseId: string): Promise<boolean> {
    try {
      const resultDelete = await courseModel.findOne({ _id: courseId });
      if (!resultDelete) {
        console.error("No course found for the given course ID.");
        return false;
      }
      const result = await resultDelete.deleteOne();
      return !!result;
    } catch (error) {
      console.error("Error deleting course:", error);
      return false;
    }
  }
  // deleteReport
  async deleteReport(courseId: string): Promise<boolean> {
    try {
      const report = await Report.findOne({ courseId: courseId });
      if (!report) {
        console.error("No report found for the given course ID.");
        return false;
      }
      const result = await report.deleteOne();
      return !!result;
    } catch (error) {
      console.error("Error deleting report:", error);
      return false;
    }
  }
  // deletePayments
  async deletePayments(course_id: string): Promise<boolean> {
    const paymentsDlt = await Payment.deleteMany({ courseId: course_id });
    return !!paymentsDlt;
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

  // dashboard funtions
  async getTotalEarnings(): Promise<number> {
    const totalEarnings = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    return totalEarnings[0]?.total || 0;
  }

  async getTotalStudents(): Promise<number> {
    const uniqueStudents = await userModel.find();
    return uniqueStudents.length;
  }

  async getActiveCourses(): Promise<number> {
    return courseModel.countDocuments({
      is_listed: false,
    });
  }

  async getTopCourses(): Promise<any[]> {
    const courses = await courseModel.find();

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
  async getCoursePerformance(): Promise<any[]> {
    const courses = await courseModel.find();

    const courseIds = courses.map((course) => String(course._id));

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

    return courses.map((course) => ({
      title: course.title,
      rating: ratings.find((r) => r._id == course._id)?.averageRating || 1,
    }));
  }
}

export default AdminRepository;
