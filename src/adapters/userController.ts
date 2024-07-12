import { Req, Res, Next } from "../infrastructure/type/expressTypes";
import UserUseCase from "../useCase/userUseCase";
import { VerifyData } from "../useCase/Interface/verifyData";

class userConroller {
  private userUseCase: UserUseCase;

  constructor(userUseCase: UserUseCase) {
    this.userUseCase = userUseCase;
  }

  // user sign up
  async signUp(req: Req, res: Res, next: Next) {
    try {
      const userVerify = await this.userUseCase.checkExist(req.body.email);

      console.log(userVerify, "exist verification kazhinju");

      if (userVerify.data.status == true) {
        console.log(
          "user not exist allaathond  usercase sinup function ilk keri"
        );
        const sendOtp = await this.userUseCase.signup(
          req.body.name,
          req.body.email
        );

        return res.status(sendOtp.status).json(sendOtp.data);
      } else {
        return res.status(userVerify.status).json(userVerify.data);
      }
    } catch (error) {
      next(error);
    }
  }

  // otp verification
  async verifyOTP(req: Req, res: Res, next: Next) {
    try {
      console.log("controller otp verify");

      const data: VerifyData = req.body;
      console.log(data, "verifyOtp data got");

      const OTPverification = await this.userUseCase.verify(data);
      console.log(OTPverification, "otp data");

      if (OTPverification.status == 400) {
        return res
          .status(OTPverification.status)
          .json({ message: OTPverification.message });
      }

      if (OTPverification.data && OTPverification.status ==200) {
        const savedUser = await this.userUseCase.saveUser(OTPverification.data);
        console.log(savedUser, "user saved data");
        res
          .status(200)
          .json({ message: "User saved successfully", data: savedUser });
      }
    } catch (error) {
      next(error);
    }
  }
}

export default userConroller;
