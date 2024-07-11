import User from "../domain/user";
import UserRepository from "../infrastructure/repository/userRepository";
import GenerateOtp from "../infrastructure/services/generateOtp";
import GenerateMail from "../infrastructure/services/sendMailer";
import EncryptPassword from "../infrastructure/services/bcryptPassword";



class UserUseCase {
  private UserRepository: UserRepository;
  private EncryptPassword:EncryptPassword;
  private GenerateOtp :GenerateOtp;
  private GenerateSendMail : GenerateMail

  constructor(

    userRepository: UserRepository,
    encryptPassword : EncryptPassword,
    generateOtp : GenerateOtp,
    generateSendMail : GenerateMail

  ) {
    this.UserRepository = userRepository;
    this.EncryptPassword = encryptPassword,
    this.GenerateOtp = generateOtp,
    this.GenerateSendMail = generateSendMail
  }

  async checkExist(email: string) {
    const userExist = await this.UserRepository.findByEmail(email);

    if (userExist) {
      return {
        status: 400,
        data: {
          status: false,
          message: "User already exist;",
        },
      };
    } else {
      return {
        status: 200,
        data: {
          status: true,
          message: "User does not exist;",
        },
      };
    }
  }



  async signup( name: string, email: string){
    const otp = this.GenerateOtp.createOtp();
    console.log("otp generate at usecase",otp);
    
    await this.UserRepository.saveOtp(name,email,otp);
    console.log("save otp at document");
    
    this.GenerateSendMail.sendMail(name,email,otp);
    console.log("mail sended");
    return {
      status:200,
      data:{
        status:true,
        message:"Verification otp sent to yout email"
      }
    };
  }

  async verify(data:{}){

  }


}

export default UserUseCase;















//   async saveUserJust(
//     name: string,
//     email: string,
//     phone: string,
//     password: string
//   ) {
//     let data: { name: string; email: string; phone: string; password: string } =
//       { name: name, email: email, phone: phone, password: password };
//     const userData = await this.UserRepository.saves(data);

//     if (userData) {
//       return {
//         status: 200,
//         data: {
//           status: true,
//           message: "saved success full",
//         },
//       };
//     } else {
//       return {
//         status: 400,
//         data: {
//           status: false,
//           message: "not saved",
//         },
//       };
//     }
//   }