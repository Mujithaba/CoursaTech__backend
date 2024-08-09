import ICourse from "../../domain/course/course";
import Tutor from "../../domain/tutor";
import ICategory from "../../domain/Icategory";


interface TutorRepo {
    saves(tutor:Tutor):Promise<Tutor>;
    findByEmail(email:string):Promise<Tutor | null>;
    findById(tutorId :string):Promise<Tutor | null>;
    saveOtp(name:string,email:string,otp:number,tutor:string):Promise<any>;
    findOtpByEmail(email:string,role:string):Promise<any>;
    forgotPassUpdate(email:string,password:string):Promise<boolean>;
    createCourse(course:ICourse):Promise<ICourse>;
    getCategory():Promise<ICategory[]>;

}

export default TutorRepo