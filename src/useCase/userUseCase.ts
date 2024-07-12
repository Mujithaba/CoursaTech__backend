import User from "../domain/user";
import UserRepository from "../infrastructure/repository/userRepository";
import GenerateOtp from "../infrastructure/services/generateOtp";
import GenerateMail from "../infrastructure/services/sendMailer";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import { VerifyData } from "./Interface/verifyData";

class UserUseCase {
  private UserRepository: UserRepository;
  private EncryptPassword: EncryptPassword;
  private GenerateOtp: GenerateOtp;
  private GenerateSendMail: GenerateMail;

  constructor(
    userRepository: UserRepository,
    encryptPassword: EncryptPassword,
    generateOtp: GenerateOtp,
    generateSendMail: GenerateMail
  ) {
      this.UserRepository = userRepository;
      this.EncryptPassword = encryptPassword,
      this.GenerateOtp = generateOtp,
      this.GenerateSendMail = generateSendMail;
  }

  // email exist checking when register
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

  // signup user usecase
  async signup(name: string, email: string) {

    const otp = this.GenerateOtp.createOtp();
    await this.UserRepository.saveOtp(name, email, otp);
    this.GenerateSendMail.sendMail(name, email, otp);

    return {
      status: 200,
      data: {
        status: true,
        message: "Verification otp sent to yout email",
      },
    };
  }

  // otp verification case
  async verify(data: VerifyData) {
    console.log("user sucase otp");

    const otpDetailes = await this.UserRepository.findOtpByEmail(
      data.userData.email
    );

    if (otpDetailes === null) {
      return { status: 400, message: "Invalid or expired OTP" };
    }

    if (otpDetailes.otp !== data.otp) {
      return { status: 400, message: "Invalid OTP" };
    }

    return {
      status: 200,
      message: "OTP verificaton successfully",
      data: data.userData,
    };
  }

  async saveUser(user: User) {
    console.log(user.password, "pass save ");

    const hashPassword = await this.EncryptPassword.encryptPassword(
      user.password as string
    );
    user.password = hashPassword
    const userSave = await this.UserRepository.saves(user)
    console.log(hashPassword,"pass hash");
    return {
      status:201,
      data:userSave
    }
    
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
