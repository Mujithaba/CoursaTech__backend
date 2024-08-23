import ICourse from "../../domain/course/course";
import Tutor from "../../domain/tutor";
import ICategory from "../../domain/Icategory";
import Lecture from "../../domain/course/lecture";
import Modules from "../../domain/course/chapter";
import { CourseData, IConversation, InterCourse, OtpDoc } from "../../infrastructure/type/expressTypes";
import { ITutorDetails } from "../../domain/tutorDetails";


interface TutorRepo {
    saves(tutor:Tutor):Promise<Tutor>;
    findByEmail(email:string):Promise<Tutor | null>;
    findById(tutorId :string):Promise<Tutor | null>;
    uploadInstructorDetails(details:ITutorDetails):Promise<ITutorDetails>;
    instructorDetailsExistId(instructorId:string):Promise<ITutorDetails | null>;
    updateTheRegister(registerData:Tutor):Promise<boolean>
    updateTheInstructorDetails(instructorDetail:ITutorDetails):Promise<boolean>

    saveOtp(name:string,email:string,otp:number,tutor:string):Promise<{}>;
    findOtpByEmail(email:string,role:string):Promise<OtpDoc | null>;
    forgotPassUpdate(email:string,password:string):Promise<boolean>;
    createCourse(course:InterCourse):Promise<ICourse>;
    getCategory():Promise<ICategory[]>;
    getInstructorCourses(id:string,limit: number, skip: number):Promise<{}[]>;
    coursesCount(id:string):Promise<number>
    // curicculum stuffs
    saveLectures(lecture:Lecture):Promise<Lecture>
    saveModules(module:Modules):Promise<Modules>
    saveModulesIdToChapter(course_id:string,modules_Id:any[]):Promise<any>
    getCourseView(course_id:string):Promise<any>
    findConversationsByReceiverId(instructor_id:string):Promise<IConversation[]>
    // assignment
    instructorCourseData(instructor_id:string):Promise<CourseData[]>
}

export default TutorRepo