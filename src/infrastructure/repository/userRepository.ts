import User from "../../domain/user";
// import IOtpDoc from "../../domain/IOtpDoc";
import userModel from "../database/userModels/userModel";
import otpDocModel from "../database/commonModel/otpDocModel";
import UserRepo from "../../useCase/Interface/userRepo";

class UserRepository implements UserRepo{
    // saving user details to  database
    async saves(user: User): Promise<User> {
        const newUser = new userModel(user);
        const saveUser = await newUser.save();
        return saveUser;
    }

    // email finding from DB
    async findByEmail(email:string):Promise<User | null>{
        const res=await userModel.findOne({email:email})
        return res
    }

    // otp details saving in db using TTL
    async saveOtp(name:string,email:string,otp:number,role:string):Promise<any>{
        const newOtpDoc = new otpDocModel({
            name:name,
            email:email,
            otp:otp,
            role:role,
            generatedAt:new Date()
        })
        const saveOtp = await newOtpDoc.save();
        console.log(saveOtp,"otp db");
        
        return saveOtp;
    }

    // otp details finding from otpDB using email
    async findOtpByEmail(email:string,role:string):Promise<any>{
        const otpData = await otpDocModel.findOne({email:email,role:role}).sort({generatedAt : -1});
        console.log(otpData,"repo otp data");
        return otpData
        
    }

}

export default UserRepository