import Tutor from "../domain/tutor"
import TutorRepository from "../infrastructure/repository/tutorRepository"
import GenerateOtp from "../infrastructure/services/generateOtp";
import GenerateMail from "../infrastructure/services/sendMailer";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import { VerifyData } from "./Interface/verifyData";
import JwtToken from "../infrastructure/services/generateToken";

class TutorUseCase {
    private TutorRepository : TutorRepository;
    private EncryptPassword : EncryptPassword;
    private GenerateOtp : GenerateOtp;
    private GenerateMail : GenerateMail;
    private JwtToken : JwtToken;


    constructor(
        tutorRepository:TutorRepository,
        encryptPassword:EncryptPassword,
        generateOtp : GenerateOtp,
        generateMail :GenerateMail,
        jwtToken :JwtToken
    ){
        this.TutorRepository=tutorRepository;
        this.EncryptPassword = encryptPassword;
        this.GenerateOtp = generateOtp;
        this.GenerateMail = generateMail;
        this.JwtToken = jwtToken;
    }

    //check email exist
  async checkExist(email: string) {
    const tutorExist = await this.TutorRepository.findByEmail(email);

    if (tutorExist) {
      return {
        status: 400,
        data: {
          status: false,
          message: "Tutor already exist;",
        },
      };
    } else {
      return {
        status: 200,
        data: {
          status: true,
          message: "Tutor does not exist;",
        },
      };
    }
  } 

//   tutor sign up
  async signup(name:string,email:string){
    const otp = await this.GenerateOtp.createOtp()
    const role ="Tutor";
    console.log(otp,"otp");
    
    await this.TutorRepository.saveOtp(name,email,otp,role)
    this.GenerateMail.sendMail(name,email,otp,role)
    return {
        status: 200,
        data: {
          status: true,
          message: "Verification otp sent to your email",
        },
      };
  }

// otp verification case
async verify(data: VerifyData) {
    console.log(data.roleData,"tutor sucase otp");

    const otpDetailes = await this.TutorRepository.findOtpByEmail(
      data.roleData.email,
      data.role
    );
    console.log(otpDetailes,"jjjj");
    

    if (otpDetailes === null) {
      return { status: 400, message: "Invalid or expired OTP" };
    }

    if (otpDetailes.otp !== data.otp) {
      return { status: 400, message: "Invalid OTP" };
    }
   
    // if (otpDetailes.role !== role) {
    //   return {status:400,message:`No OTP found for ${role} with the provided email.`}
    // }
    return {
      status: 200,
      message: "OTP verificaton successfully",
      data: data.roleData,
    };
  }

  async saveTutor(tutor: Tutor) {
    console.log(tutor.password, "pass save ");

    const hashPassword = await this.EncryptPassword.encryptPassword(
        tutor.password as string
    );
    tutor.password = hashPassword;
    const userSave = await this.TutorRepository.saves(tutor);
    console.log(hashPassword, "pass hash");
    return {
      status: 201,
      data: userSave,
    };
  }

//   login use case
  async login(email: string, password: string) {
    const tutor = await this.TutorRepository.findByEmail(email);
    let token = "";

    if (tutor) {
      let data = {
        _id: tutor._id,
        name: tutor.name,
        email: tutor.email,
        password: tutor.password,
        isBlock: tutor.isBlocked,
        isAdmin: tutor.isAdmin,
        isGoogle: tutor.isGoogle,
      };

      if (tutor.isBlocked) {
        return {
          status: 400,
          data: {
            status: false,
            message: "You have been blocked by admin!",
            token: "",
          },
        };
      }

      const passwordMatch = await this.EncryptPassword.compare(
        password,
        tutor.password
      );

      if (passwordMatch) {
        token = this.JwtToken.generateToken(tutor._id, "tutor");
        console.log(token, "token");

        return {
          status: 200,
          data: {
            status: true,
            message: data,
            token,
          },
        };
      } else {
        return {
          status: 400,
          data: {
            status: false,
            message: "Invalid email or password",
            token: "",
          },
        };
      }
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "Invalid email or password",
          token: "",
        },
      };
    }
  }

  async resend_otp (name:string,email:string){
    const otp = this.GenerateOtp.createOtp();
    console.log(otp,"OTP");
    
    const role = "Tutor"
    await this.TutorRepository.saveOtp(name, email, otp,role);
     this.GenerateMail.sendMail(name, email, otp,role);

    return {
      status: 200,
      data: {
        status: true,
        message: " Resend otp sent to your email",
      },
    };
  }


  async forgotPassword(email: string) {
    const tutorExist = await this.TutorRepository.findByEmail(email);
    console.log(tutorExist, "data");

    if (tutorExist?.isGoogle) {
      return {
        status: 403,
        data: {
          status: false,
          message:
            "You cannot change the password because you used Google registration",
            tutorData: tutorExist,
        },
      };
    }

    if (tutorExist) {
      const otp = this.GenerateOtp.createOtp();
      const role = "Tutor";

      await this.GenerateMail.sendMail(
        tutorExist.name,
        tutorExist.email,
        otp,
        role
      );
      await this.TutorRepository.saveOtp( tutorExist.name, tutorExist.email, otp, role);

      return {
        status: 200,
        data: {
          status: true,
          message: "Verification OTP sent to your Email",
          tutorData: tutorExist,
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "Email not registered",
        },
      };
    }
  }


  async resetPassword (email:string,password:string){
    console.log(email,"kkkkoi");
    
    const hashPassword = await this.EncryptPassword.encryptPassword(password as string)
    const result = await this.TutorRepository.forgotPassUpdate(email,hashPassword)
    if (result) {
      return {
        status:200,
        message:"Password changed successfully"
      }
    } else {
      return {
        status:200,
        message:"Something went wrong Password change,Please try later"
      }
    }
  }

  // taking userData by id
  async getUser(userId:string){
    console.log("get user use case");
    
    const tutorData = await this.TutorRepository.findById(userId)
    if (tutorData) {
      return {
        status: 200,
        data:{
          message: "getting the instructor data",
          data:tutorData
        }
       
      };
    } else {
      return {
        status: 400,
          message: "something went wrong getting the user data",
      };
    }
  }

}

export default TutorUseCase