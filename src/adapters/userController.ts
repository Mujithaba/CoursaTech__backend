import { Req, Res, Next } from "../infrastructure/type/expressTypes";
import UserUseCase from "../useCase/userUseCase";
import { VerifyData } from "../useCase/Interface/verifyData";

import { Request, Response, NextFunction } from "express";
import { log } from "console";
import { strict } from "assert";

class userConroller {
  private userUseCase: UserUseCase;

  constructor(userUseCase: UserUseCase) {
    this.userUseCase = userUseCase;
  }

  // user sign up
  async signUp(req: Req, res: Res, next: Next) {
    try {
      const userVerify = await this.userUseCase.checkExist(req.body.email);
      if (userVerify.data.status == true) {
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
      const data: VerifyData = req.body;
      const OTPverification = await this.userUseCase.verify(data);

      if (OTPverification.status == 400) {
        return res
          .status(OTPverification.status)
          .json({ message: OTPverification.message });
      }
      if (OTPverification.data && OTPverification.status == 200) {
        const savedUser = await this.userUseCase.saveUser(OTPverification.data);

        return res
          .status(200)
          .json({ message: "User verification successfully", data: savedUser });
      }
    } catch (error) {
      next(error);
    }
  }

  // login
  async login(req: Req, res: Res, next: Next) {
    try {
      const { email, password } = req.body;

      const user = await this.userUseCase.login(email, password);
      return res.status(user.status).json(user.data);
    } catch (error) {
      next(error);
    }
  }

  // resendOTP
  async resendOtp(req: Req, res: Res, next: Next) {
    try {
      const { name, email } = req.body;
      console.log(name, email, "otp contoller");

      const resendOTP = await this.userUseCase.resend_otp(name, email);
      return res.status(resendOTP.status).json(resendOTP.data);
    } catch (error) {
      next(error);
    }
  }

  // google sign up or login
  async googleUse(req: Req, res: Res, next: Next) {
    try {
      const { name, email, phone, password, isGoogled } = req.body;
      const checkExist = await this.userUseCase.checkExist(email);

      if (checkExist.data.status == true) {
        const data = {
          name: name,
          email: email,
          phone: phone,
          password: password,
          isGoogle: isGoogled,
        };

        await this.userUseCase.saveUser(data);
        const user = await this.userUseCase.login(email, password);
        return res.status(user.status).json(user.data);
      } else if (checkExist.data.status == false) {
        const user = await this.userUseCase.login(email, password);
        return res.status(user.status).json(user.data);
      }
    } catch (error) {
      next(error);
    }
  }

  // forgotpassword
  async forgotPass(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body.email;
      console.log(email, "email fgt");

      const user = await this.userUseCase.forgotPassword(email);
      if (user.status == 403) {
        return res.status(user.status).json(user.data);
      } else if (user.status == 200) {
        return res.status(user.status).json(user.data);
      } else {
        return res.status(user.status).json(user.data);
      }
    } catch (error) {
      next(error);
    }
  }

  // forgot pass otp verify
  async forgotOTPverify(req: Req, res: Res, next: Next) {
    try {
      const data: VerifyData = req.body;
      // console.log(data,"ppp");

      const verify = await this.userUseCase.verify(data);
      console.log(verify.data?.email, "verify");

      if (verify.status == 400) {
        return res.status(verify.status).json({ message: verify.message });
      } else if (verify.status == 200) {
        return res.status(verify.status).json(verify);
      }
    } catch (error) {
      next(error);
    }
  }

  // reset password
  async resetPassword(req: Req, res: Res, next: Next) {
    try {
      console.log("geooo");

      const { email, password } = req.body;
      console.log(email, password, "uuuu");
      const result = await this.userUseCase.resetPassword(email, password);
      if (result.status == 200) {
        return res.status(result.status).json({ message: result.message });
      } else {
        return res.status(result.status).json({ message: result.message });
      }
    } catch (error) {
      next(error);
    }
  }

  // homePage
  async homePage(req:Req,res:Res,next:Next){
    try {
      console.log(req.query.id,"user id in controller");
      const userId = req.query.id as string
      
      const user = await this.userUseCase.getUser(userId)
      console.log(user);

      if (user.status == 200) {
        return res.status(user.status).json(user.data?.data)
      } else {
        return res.status(user.status).json(user.data?.message)
      }

    } catch (error) {
      next(error)
    }
  }
}

export default userConroller;
