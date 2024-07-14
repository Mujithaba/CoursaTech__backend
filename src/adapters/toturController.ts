import { Req, Res, Next } from "../infrastructure/type/expressTypes";
import { VerifyData } from "../useCase/Interface/verifyData";
import TutorUseCase from "../useCase/tutorUseCase";

class TutorController {
  private tutorUseCase: TutorUseCase;
  constructor(tutorUseCase: TutorUseCase) {
    this.tutorUseCase = tutorUseCase;
  }

  async signup(req: Req, res: Res, next: Next) {
    try {
      const tutorVerify = await this.tutorUseCase.checkExist(req.body.email);
      console.log("tutor controller ", req.body.email);

      if (tutorVerify.data.status == true) {
        const sendOtp = await this.tutorUseCase.signup(
          req.body.name,
          req.body.email
        );

        return res.status(sendOtp.status).json(sendOtp.data);
      } else {
        return res.status(tutorVerify.status).json(tutorVerify.data);
      }
    } catch (error) {
      next(error);
    }
  }

//   otp verification of tutor
  async verifyOTP(req:Req, res:Res,next:Next){
    try {
        const data: VerifyData = req.body;

        const OTPverification = await this.tutorUseCase.verify(data);
  
        if (OTPverification.status == 400) {
          return res
            .status(OTPverification.status)
            .json({ message: OTPverification.message });
        }
  
        if (OTPverification.data && OTPverification.status ==200) {
          const savedTutor = await this.tutorUseCase.saveTutor(OTPverification.data);
          console.log(savedTutor, "tutur saved data");
          res
            .status(200)
            .json({ message: "Tutor saved successfully", data: savedTutor });
        }
      } catch (error) {
        next(error);
      }
  }

   // login
   async login(req:Req,res:Res,next:Next){
    try {
      
      const { email, password } = req.body;
      
    const user = await this.tutorUseCase.login(email,password)
    console.log(user,"login controller");
    return res.status(user.status).json(user.data)
      
    } catch (error) {
      next(error);
    }
  }

   // resendOTP
   async resendOtp(req:Req,res:Res,next:Next){
    try {
      const {name,email } = req.body
      console.log(name,email,"otp contoller");
      
      const  resendOTP = await this.tutorUseCase.resend_otp(name,email)
      return res.status(resendOTP.status).json(resendOTP.data);
    } catch (error) {
      next(error)
    }
  }

}
export default TutorController;
