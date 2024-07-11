import User from "../../domain/user";
import IOtpDoc from "../../domain/IOtpDoc";
import userModel from "../database/userModel";
import otpDocModel from "../database/otpDocModel";
import UserRepo from "../../useCase/Interface/userRepo";

class UserRepository implements UserRepo{
    // saving user details to  database
    async saves(user: User): Promise<User> {
        const newUser = new userModel(user);
        const saveUser = await newUser.save();
        return saveUser;
    }

    async findByEmail(email:string):Promise<User | null>{
        const exist=await userModel.findOne({email:email})
        return exist
    }

    // otp details saving in db using TTL
    async saveOtp(name:string,email:string,otp:number):Promise<any>{
        const newOtpDoc = new otpDocModel({
            name:name,
            email:email,
            otp:otp,
            generatedAt:new Date()
        })
        const saveOtp = await newOtpDoc.save();
        console.log(saveOtp,"otp db");
        
        return saveOtp;
    }

}

export default UserRepository