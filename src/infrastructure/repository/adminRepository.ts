import Tutor from "../../domain/tutor";
import User from "../../domain/user";
import AdminRep from "../../useCase/Interface/adminRepo";
import tutorModel from "../database/tutorModel/tutorModel";
import userModel from "../database/userModels/userModel";

class AdminRepository implements AdminRep {

  // async findUsers(page: number, limit: number): Promise<{ users: User[], totalUsers: number }> {
  //   const totalUsers = await userModel.countDocuments({ isAdmin: false });
  //   const users = await userModel
  //     .find({ isAdmin: false })
  //     .skip((page - 1) * limit)
  //     .limit(limit);
  //   return { users, totalUsers };
  // }
  async findUsers(page: number, limit: number): Promise<{ users: User[]; totalUsers: number }> {
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
      {_id:userID},
      {$set:{isBlocked:false}}
    )
    return result.modifiedCount > 0
  }

  // taking all tutors from db
  async findTutors(page: number, limit: number): Promise<{tutors:Tutor[] ,totalTutors:number}> {
    const totalTutors = await tutorModel.countDocuments();
    const tutors = await userModel
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
      {_id:tutorID},
      {$set:{isBlocked:false}}
    )
    return result.modifiedCount > 0
  }

}

export default AdminRepository;
