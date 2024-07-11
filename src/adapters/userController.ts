import { Req, Res, Next } from "../infrastructure/type/expressTypes";
import UserUseCase from "../useCase/userUseCase";

class userConroller {
  private userUseCase: UserUseCase;

  constructor(userUseCase: UserUseCase) {
    this.userUseCase = userUseCase;
  }

  async signUp(req: Req, res: Res, next: Next) {
    try {
      const userVerify = await this.userUseCase.checkExist(req.body.email);

      console.log(userVerify,"exist verification kazhinju");

      if (userVerify.data.status == true) {
        console.log("user not exist allaathond  usercase sinup function ilk keri");
        const sendOtp = await this.userUseCase.signup(
          req.body.name,
          req.body.email
        );
        
        return res.status(sendOtp.status).json(sendOtp.data)
      } else{
        return res.status(userVerify.status).json(userVerify.data)
      }
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req:Req,res:Res,next:Next) {
    console.log("kitti otp from frontend",req.body.data)
    // const OTPverification = await this.userUseCase.verify(req.body.data)
    // console.log(OTPverification,"otp data");
    
  }



}

export default userConroller;
