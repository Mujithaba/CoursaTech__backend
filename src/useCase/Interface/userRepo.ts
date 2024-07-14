import User from "../../domain/user";



interface UserRepo {
    saves(user:User):Promise<User>;
    findByEmail(email:string):Promise<User | null>;
    saveOtp(name:string,email:string,otp:number,user:string):Promise<any>;
    findOtpByEmail(email:string,role:string):Promise<any>;
   
}

export default UserRepo