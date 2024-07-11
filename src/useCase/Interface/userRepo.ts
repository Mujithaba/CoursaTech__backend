import User from "../../domain/user";
import IOtpDoc from "../../domain/IOtpDoc";




interface UserRepo {
    saves(user:User):Promise<User>;
    findByEmail(email:string):Promise<User | null>;
    saveOtp(name:string,email:string,otp:number):Promise<any>
   
}

export default UserRepo