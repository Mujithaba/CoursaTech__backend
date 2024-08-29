import Tutor from "../../domain/tutor";
import User from "../../domain/user";
import AdminRep from "../../useCase/Interface/adminRepo";
import tutorModel from "../database/tutorModel/tutorModel";
import userModel from "../database/userModels/userModel";
import ICategory from "../../domain/Icategory";
import categoryModel from "../database/adminModel/categoryModel";
import { time } from "console";
import courseModel from "../database/tutorModel/courseModel";
import ICourse from "../../domain/course/course";
import { IGetReviews, IInstructorDetails } from "../type/expressTypes";
import InstructorDetails from "../database/tutorModel/tutorDetailsModel";
import assignmentModel from "../database/tutorModel/assignmentModel";
import { Assignment } from "../../domain/course/assignment";
import Review from "../database/commonModel/reviewModel";

class AdminRepository implements AdminRep {
  // async findUsers(page: number, limit: number): Promise<{ users: User[], totalUsers: number }> {
  //   const totalUsers = await userModel.countDocuments({ isAdmin: false });
  //   const users = await userModel
  //     .find({ isAdmin: false })
  //     .skip((page - 1) * limit)
  //     .limit(limit);
  //   return { users, totalUsers };
  // }
  async findUsers(
    page: number,
    limit: number
  ): Promise<{ users: User[]; totalUsers: number }> {
    const totalUsers = await userModel.countDocuments({ isAdmin: false });
    const users = await userModel
      .find({ isAdmin: false })
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
    console.log(result, "repos user");

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
    console.log(result, "repos user");

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
    const coursesData = await courseModel.find().populate({
      path: 'category_id',
      select: 'categoryName',
    })
    .populate({path:'chapters',
      model:"Module",
      select:'name lectures createdAt',
      populate:{
        path:'lectures',
        model:"Lecture",
        select: 'title description  video  pdf createdAt'
      }
      })
      .limit(limit)
      .skip(skip)
    .lean()
    .exec();

    return coursesData;
  }
  async coursesCount(): Promise<number> {
    const counts = await courseModel.countDocuments();
    return counts;
  }
  // getCourseView
  async getCourseView(course_id: string): Promise<any> {
    const getTutorCourses = await courseModel
    .findById(course_id)
    .populate({
      path: 'category_id',
      select: 'categoryName',
    })
    .populate({path:'chapters',
      model:"Module",
      select:'name lectures createdAt',
      populate:{
        path:'lectures',
        model:"Lecture",
        select: 'title description  video  pdf createdAt'
      }
      })
    .lean()
    .exec();
    console.dir(getTutorCourses, { depth: null, colors: true });
    
  return getTutorCourses;
  }
  // course approvel
 async findUnapprovedCourse(): Promise<any> {
  const totalUnverify = await courseModel.countDocuments({is_verified:false})
  console.log(totalUnverify,"totalUnverify............................................");
  
  const getCourses = await courseModel
  .find({is_verified:false})
  .populate({
    path: 'category_id',
    select: 'categoryName',
  })
  .populate({path:'chapters',
    model:"Module",
    select:'name lectures createdAt',
    populate:{
      path:'lectures',
      model:"Lecture",
      select: 'title description  video  pdf createdAt'
    }
    })
  .lean()
  .exec();
  console.dir(getCourses, { depth: null, colors: true });
  
return{ getCourses,totalUnverify};
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
  console.log("erepo insru data",instructorId);
  
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
console.log(instructorData,"instructorData");

  return instructorData;
}
}

export default AdminRepository;
