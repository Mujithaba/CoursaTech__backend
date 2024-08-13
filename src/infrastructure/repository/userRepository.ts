import User from "../../domain/user";
// import IOtpDoc from "../../domain/IOtpDoc";
import userModel from "../database/userModels/userModel";
import otpDocModel from "../database/commonModel/otpDocModel";
import UserRepo from "../../useCase/Interface/userRepo";
import { log } from "console";

class UserRepository implements UserRepo {
  // saving user details to  database
  async saves(user: User): Promise<User> {
    const newUser = new userModel(user);
    const saveUser = await newUser.save();
    return saveUser;
  }

  // email finding from DB
  async findByEmail(email: string): Promise<User | null> {
    const userData = await userModel.findOne({ email: email });
    return userData;   
  }

  // find by id
  async findById(userId: string): Promise<User | null> {
    const userData = await userModel.findById({_id:userId})
    console.log(userData,"find by id");
    return userData
    
  }

  // otp details saving in db using TTL
  async saveOtp(
    name: string,
    email: string,
    otp: number,
    role: string
  ): Promise<any> {
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
  async findOtpByEmail(email: string, role: string): Promise<any> {
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
}

export default UserRepository;
