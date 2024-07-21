import Tutor from "../../domain/tutor";
import User from "../../domain/user";
import AdminRep from "../../useCase/Interface/adminRepo";
import tutorModel from "../database/tutorModel/tutorModel";
import userModel from "../database/userModels/userModel";

class AdminRepository implements AdminRep {

  async findUsers(): Promise<User[] | null> {
    const users = await userModel.find({ isAdmin: false });
    return users;
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
  async findTutors(): Promise<Tutor[] | null> {
    const tutors = await tutorModel.find();
    return tutors;
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
