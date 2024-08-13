import ICourse from "../../domain/course/course";
import Tutor from "../../domain/tutor";
import ICategory from "../../domain/Icategory";
import Lecture from "../../domain/course/lecture";
import Modules from "../../domain/course/chapter";


interface TutorRepo {
    saves(tutor:Tutor):Promise<Tutor>;
    findByEmail(email:string):Promise<Tutor | null>;
    findById(tutorId :string):Promise<Tutor | null>;
    saveOtp(name:string,email:string,otp:number,tutor:string):Promise<any>;
    findOtpByEmail(email:string,role:string):Promise<any>;
    forgotPassUpdate(email:string,password:string):Promise<boolean>;
    createCourse(course:ICourse):Promise<any>;
    getCategory():Promise<ICategory[]>;
    getInstructorCourses(id:string):Promise<{}[]>;
    // curicculum stuffs
    saveLectures(lecture:Lecture):Promise<any>
    saveModules(module:any):Promise<any>
    saveModulesIdToChapter(course_id:string,modules_Id:any[]):Promise<any>
    getCourseView(course_id:string):Promise<any>
}

export default TutorRepo