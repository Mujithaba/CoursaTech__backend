import Tutor from "../../domain/tutor";
import User from "../../domain/user";
import AdminRep from "../../useCase/Interface/adminRepo";
import tutorModel from "../database/tutorModel/tutorModel";
import userModel from "../database/userModels/userModel";
import ICategory from "../../domain/Icategory";
import categoryModel from "../database/adminModel/categoryModel";

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
}

export default AdminRepository;
