import Tutor from "../../domain/tutor";


interface TutorRepo {
    saves(tutor:Tutor):Promise<Tutor>;
    findByEmail(email:string):Promise<Tutor | null>;
    saveOtp(name:string,email:string,otp:number,tutor:string):Promise<any>;
    findOtpByEmail(email:string,role:string):Promise<any>;
   
}

export default TutorRepo