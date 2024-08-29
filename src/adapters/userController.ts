import { Req, Res, Next } from "../infrastructure/type/expressTypes";
import UserUseCase from "../useCase/userUseCase";
import { VerifyData } from "../useCase/Interface/verifyData";
import { Request, Response, NextFunction } from "express";
import Razorpay from "razorpay";
import { log } from "console";

class userConroller {
  private _userUseCase: UserUseCase;

  constructor(userUseCase: UserUseCase) {
    this._userUseCase = userUseCase;
  }

  // user sign up
  async signUp(req: Req, res: Res, next: Next) {
    try {
      const userVerify = await this._userUseCase.checkExist(req.body.email);
      if (userVerify.data.status == true) {
        const sendOtp = await this._userUseCase.signup(
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
      const OTPverification = await this._userUseCase.verify(data);

      if (OTPverification.status == 400) {
        return res
          .status(OTPverification.status)
          .json({ message: OTPverification.message });
      }
      if (OTPverification.data && OTPverification.status == 200) {
        const savedUser = await this._userUseCase.saveUser(
          OTPverification.data
        );

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

      const user = await this._userUseCase.login(email, password);
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

      const resendOTP = await this._userUseCase.resend_otp(name, email);
      return res.status(resendOTP.status).json(resendOTP.data);
    } catch (error) {
      next(error);
    }
  }

  // google sign up or login
  async googleUse(req: Req, res: Res, next: Next) {
    try {
      const { name, email, phone, password, isGoogled } = req.body;
      const checkExist = await this._userUseCase.checkExist(email);

      if (checkExist.data.status == true) {
        const data = {
          name: name,
          email: email,
          phone: phone,
          password: password,
          isGoogle: isGoogled,
        };

        await this._userUseCase.saveUser(data);
        const user = await this._userUseCase.login(email, password);
        return res.status(user.status).json(user.data);
      } else if (checkExist.data.status == false) {
        const user = await this._userUseCase.login(email, password);
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

      const user = await this._userUseCase.forgotPassword(email);
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

      const verify = await this._userUseCase.verify(data);
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
      const result = await this._userUseCase.resetPassword(email, password);
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
  async homePage(req: Req, res: Res, next: Next) {
    try {
      console.log(req.query.id, "user id in controller");
      const userId = req.query.id as string;

      const user = await this._userUseCase.getUser(userId);
      console.log(user);

      if (user.status == 200) {
        return res.status(user.status).json(user.data?.data);
      } else {
        return res.status(user.status).json(user.data?.message);
      }
    } catch (error) {
      next(error);
    }
  }
  // get all courses list
  async getCourses(req: Req, res: Res, next: Next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const courses = await this._userUseCase.allCourseGet(Number(limit), skip);

      if (courses) {
        const totalItems = await this._userUseCase.countCourses();
        return res.status(courses.status).json({ ...courses.data, totalItems });
      } else {
        return res.status(404).json({ message: "No courses found" });
      }
    } catch (error) {
      next(error);
    }
  }

  // get view course
  async ViewCourses(req: Req, res: Res, next: Next) {
    try {
      console.log("getViewCourse controller");
      const id = req.query.id as string;
      const userid = req.query.userId as string;
      console.log(id, userid, "getViewCourse controller");
      const courseViewData = await this._userUseCase.getViewCourse(id, userid);

      if (courseViewData) {
        return res.status(courseViewData.status).json(courseViewData.data);
      } else {
        return res.status(404).json({ message: "No course found" });
      }
    } catch (error) {
      next(error);
    }
  }
  // create payment
  async coursePayment(req: Req, res: Res, next: Next) {
    try {
      console.log("courseId");
      const { courseId } = req.body;
      console.log(courseId, "payment controller");
      const paymentDetails = await this._userUseCase.createPyment(courseId);
      console.log(paymentDetails, "paymentDetails");

      if (paymentDetails) {
        return res.status(200).json(paymentDetails.response);
      } else {
        return res
          .status(400)
          .json({ message: "something went wrong the creation of payment" });
      }
    } catch (error) {
      next(error);
    }
  }
  // paymentCompleted
  async paymentCompleted(req: Req, res: Res, next: Next) {
    try {
      console.log("paymentCompleted");

      const { data } = req.body;
      console.log(data, "data");
      console.log(data.res, "res data");
      console.log(data.courseID, "res data");
      console.log(data.userID, "res data");
      const successPayment = await this._userUseCase.successPayment(data);
      if (successPayment) {
        return res.status(200).json(successPayment);
      } else {
        return res.status(400).json(successPayment);
      }
    } catch (error) {
      next(error);
    }
  }

  // sendUserMsg
  async storeUserMsg(req: Req, res: Res, next: Next) {
    try {
      const { message,userId,instructorId,username} = req.body;

      const saveMsg = await this._userUseCase.storeUserMsg(
        message,
        userId,
        instructorId,
        username
      );
      console.log(saveMsg, "sss");

      if (saveMsg) {
        return res.status(saveMsg.status).json(saveMsg);
      }
    } catch (error) {
      next(error);
    }
  }
  // uploadReviews
  async uploadReviews (req:Req,res:Res,next:Next){
    try {
      const {rating,feedback,courseId,userId,userName} = req.body;
      console.log(rating,feedback,courseId,userId,userName,"rating,feedback,courseId,userId,userName");
      
      const reviewUpload = await this._userUseCase.reviewsUpload(courseId,userId,userName,feedback,rating)
      if (reviewUpload) {
        return res.status(reviewUpload.status).json(reviewUpload)
      }
      
    } catch (error) {
      next(error)
    }
  }
  // reviewsFetch
  async getReviews(req:Req,res:Res,next:Next){
    try {
      const courseId = req.query.courseId as string;
      console.log(courseId,"hhh");
      const getReview = await this._userUseCase.reviewsFetch(courseId)
      if (getReview) {
        return res.status(getReview.status).json(getReview)
      }
      
    } catch (error) {
      next(error)
    }
  }
  // fetchAssignments
  async fetchAssignments (req:Req,res:Res,next:Next){
    try {

      const courseId=  req.query.courseId  as string
      console.log(courseId,"assignments---");
      const assignmentsData= await this._userUseCase.getAssignments(courseId)
      return res.status(assignmentsData.status).json(assignmentsData.data)
      
    } catch (error) {
      next(error)
    }
  }
  // getInstructor
  async getInstructor (req:Req,res:Res,next:Next){
    try {
      const instructorId=  req.query.instructorId  as string
      const instructorData = await this._userUseCase.getInstructorDetails(instructorId)
      return res.status(instructorData.status).json(instructorData.data)
    } catch (error) {
      next(error)
    }
  }
}

export default userConroller;
