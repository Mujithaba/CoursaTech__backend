import User from "../../domain/user";
import Tutor from "../../domain/tutor";
import ICategory from "../../domain/Icategory";

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
  createCategory(category: ICategory): Promise<{ success: boolean; reason: string }>
  findCategory(
    page: number,
    limit: number
  ): Promise<{ categories: ICategory[]; totalCategory: number }>;
  UpdateCategory(
    newCategory: string,
    category_id: string
  ): Promise<{ success: boolean; reason: string }>;
}

export default AdminRep;