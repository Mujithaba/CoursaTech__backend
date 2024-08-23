import { Conversation } from "../../domain/conversationMsg";
import ICourse from "../../domain/course/course";
import { IMessage } from "../../domain/message";
import { IPayment } from "../../domain/payment";
import User from "../../domain/user";
import {  OtpDoc } from "../../infrastructure/type/expressTypes";



interface UserRepo {
    saves(user:User):Promise<User>;
    findByEmail(email:string):Promise<User | null>;
    findById(userId :string):Promise<User | null>;
    saveOtp(name:string,email:string,otp:number,user:string):Promise<OtpDoc>;
    findOtpByEmail(email:string,role:string):Promise<OtpDoc | null>;
    forgotPassUpdate(email:string,password:string):Promise<boolean>;
    getCourses(limit: number, skip: number): Promise<{}[]>;
    coursesCount():Promise<number>
    getCourseView(course_id: string,userid:string): Promise<any>;
    findCourseById(course_id:string):Promise<ICourse | null>;
    savePayments(payment:IPayment):Promise<IPayment>
    storeMesssage(messages:IMessage):Promise<IMessage>
    createConversation(lastMessage:Conversation):Promise<Conversation | null>
}

export default UserRepo