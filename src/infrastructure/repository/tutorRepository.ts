import Tutor from "../../domain/tutor";
import TutorRepo from "../../useCase/Interface/tutorRepo";
import tutorModel from "../database/tutorModel/tutorModel";
import OtpDocModel from "../database/commonModel/otpDocModel";


class TutorRepository implements TutorRepo {

    //save tutor to DB 
    async saves(tutor:Tutor):Promise<Tutor>{
        const newTutor = new tutorModel(tutor)
        const saveTutor = await newTutor.save()
        return saveTutor
    }

    // email finding from DB
async findByEmail(email: string): Promise<Tutor | null> {
    const res = await tutorModel.findOne({email:email});
    return res
}

// otp taking from db
async saveOtp(name: string, email: string, otp: number, role: string): Promise<any> {
    const newOtpDoc = new OtpDocModel({
        name:name,
        email:email,
        otp:otp,
        role:role,
        generatedAt:new Date()
    })
    const saveOtp = await newOtpDoc.save()
    console.log(saveOtp,"tutor otp data");
    
    return saveOtp
}

async findOtpByEmail(email: string,role:string): Promise<any> {
    const otpData = await OtpDocModel.findOne({email:email,role:role}).sort({generatedAt : -1});
    console.log(otpData,"repo otp data");
    return otpData
}


}

export default TutorRepository;