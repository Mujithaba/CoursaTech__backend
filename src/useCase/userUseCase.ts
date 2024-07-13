import User from "../domain/user";
import UserRepository from "../infrastructure/repository/userRepository";
import GenerateOtp from "../infrastructure/services/generateOtp";
import GenerateMail from "../infrastructure/services/sendMailer";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import { VerifyData } from "./Interface/verifyData";
import JwtToken from "../infrastructure/services/generateToken";
import { log } from "console";

class UserUseCase {
  private UserRepository: UserRepository;
  private EncryptPassword: EncryptPassword;
  private GenerateOtp: GenerateOtp;
  private GenerateSendMail: GenerateMail;
  private JwtToken: JwtToken;

  constructor(
    userRepository: UserRepository,
    encryptPassword: EncryptPassword,
    generateOtp: GenerateOtp,
    generateSendMail: GenerateMail,
    jwtToken: JwtToken
  ) {
    this.UserRepository = userRepository;
    (this.EncryptPassword = encryptPassword),
      (this.GenerateOtp = generateOtp),
      (this.GenerateSendMail = generateSendMail);
    this.JwtToken = jwtToken;
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
    user.password = hashPassword;
    const userSave = await this.UserRepository.saves(user);
    console.log(hashPassword, "pass hash");
    return {
      status: 201,
      data: userSave,
    };
  }

  async login(email: string, password: string) {
    const user = await this.UserRepository.findByEmail(email);
    console.log(user, "login user data");
    let token = "";

    if (user) {
      let data = {
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        isBlock:user.isBlocked,
        isAdmin:user.isAdmin,
        isGoogle:user.isGoogle
      };

      if (user.isBlocked) {
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
        user.password
      );

      if (passwordMatch && user.isAdmin) {
        token = this.JwtToken.generateToken(user._id, "admin");

        return {
          status: 200,
          data: {
            status: true,
            message: data,
            token,
            isAdmin: true,
          },
        };
      }

      if (passwordMatch) {
        token = this.JwtToken.generateToken(user._id, "user");
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
}

export default UserUseCase;
