import ICourse from "../../domain/course/course";
import Tutor from "../../domain/tutor";
import ICategory from "../../domain/Icategory";
import Lecture from "../../domain/course/lecture";
import Modules from "../../domain/course/chapter";
import { CourseData, IAssignment, IConversation, IFile, IGetReviews, IInstructorDetails, InstructorDashboardData, InterCourse, Message, OtpDoc, TutorDetails } from "../../infrastructure/type/expressTypes";
import { ITutorDetails } from "../../domain/tutorDetails";
import { Assignment } from "../../domain/course/assignment";
import { IMessage } from "../../domain/message";
import { Conversation } from "../../domain/conversationMsg";


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
    coursesCount(id:string):Promise<number>;
    // curicculum stuffs
    saveLectures(lecture:Lecture):Promise<Lecture>;
    saveModules(module:Modules):Promise<Modules>;
    saveModulesIdToChapter(course_id:string,modules_Id:any[]):Promise<any>;
    getCourseView(course_id:string):Promise<any>;
    findConversationsByReceiverId(instructor_id:string):Promise<IConversation[]>;
    // assignment
    instructorCourseData(instructor_id:string):Promise<CourseData[]>;
    addAssignment(courseId:string,courseTitle:string,assignmenturl:string):Promise<boolean>;
    findAssignments(instructor_id:string):Promise<IAssignment[]>;
    getReview(courseId:string):Promise<IGetReviews[]>;
    fetchAssignments(courseId:string):Promise<Assignment[]>;
    fetchInstructor(instructorId:string):Promise<IInstructorDetails>;
    findByIdInstructorDetailsAndUpdate(instructor_id:string,newImageUrl:string):Promise<TutorDetails |null>
    storeMesssage(messages:IMessage):Promise<IMessage>;
    createConversation(lastMessage:Conversation):Promise<Conversation | null>;
    getMsgs(senderId:string,receiverId:string):Promise<IMessage[]|null>;

}

export default TutorRepo