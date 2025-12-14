import { Req, Res, Next } from "../infrastructure/type/expressTypes";
import UserUseCase from "../useCase/userUseCase";
import { VerifyData } from "../useCase/Interface/verifyData";
import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  file?: Express.Multer.File;
}

class userConroller {
  private _userUseCase: UserUseCase;

  constructor(userUseCase: UserUseCase) {
    this._userUseCase = userUseCase;
  }

  // user sign up
  async signUp(req: Req, res: Res, next: Next) {
    try {
      const user = req.body
      const userVerify = await this._userUseCase.checkExist(req.body.email);
      if (userVerify.data.status == true) {
        const save = await this._userUseCase.saveUser(
          user
        );

        return res.status(save.status).json(save.data);
      } else {
        return res.status(userVerify.status).json(userVerify.data);
      }
    } catch (error) {
      next(error);
    }
  }

  // otp verification
  // async verifyOTP(req: Req, res: Res, next: Next) {
  //   try {
  //     const data: VerifyData = req.body;
  //     const OTPverification = await this._userUseCase.verify(data);

  //     if (OTPverification.status == 400) {
  //       return res
  //         .status(OTPverification.status)
  //         .json({ message: OTPverification.message });
  //     }
  //     if (OTPverification.data && OTPverification.status == 200) {
  //       const savedUser = await this._userUseCase.saveUser(
  //         OTPverification.data
  //       );

  //       return res
  //         .status(200)
  //         .json({ message: "User verification successfully", data: savedUser });
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // }

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

      const verify = await this._userUseCase.verify(data);

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
      const { email, password } = req.body;
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
      const {
        page = 1,
        limit = 10,
        searchTerm = "",
        category = "",
      } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const courses = await this._userUseCase.allCourseGet(
        Number(limit),
        skip,
        searchTerm as string,
        category as string
      );

      if (courses) {
        const totalItems = await this._userUseCase.countCourses(
          searchTerm as string,
          category as string
        );
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
      const id = req.query.id as string;
      const userid = req.query.userId as string;
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
      const { courseId } = req.body;
      const paymentDetails = await this._userUseCase.createPyment(courseId);

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
      const { message, userId, instructorId, username, instructorName } =
        req.body;

      const saveMsg = await this._userUseCase.storeUserMsg(
        message,
        userId,
        instructorId,
        username,
        instructorName
      );

      if (saveMsg) {
        return res.status(saveMsg.status).json(saveMsg);
      }
    } catch (error) {
      next(error);
    }
  }
  // uploadReviews
  async uploadReviews(req: Req, res: Res, next: Next) {
    try {
      const { rating, feedback, courseId, userId, userName } = req.body;

      const reviewUpload = await this._userUseCase.reviewsUpload(
        courseId,
        userId,
        userName,
        feedback,
        rating
      );
      if (reviewUpload) {
        return res.status(reviewUpload.status).json(reviewUpload);
      }
    } catch (error) {
      next(error);
    }
  }
  // reviewsFetch
  async getReviews(req: Req, res: Res, next: Next) {
    try {
      const courseId = req.query.courseId as string;
      const getReview = await this._userUseCase.reviewsFetch(courseId);
      if (getReview) {
        return res.status(getReview.status).json(getReview);
      }
    } catch (error) {
      next(error);
    }
  }
  // fetchAssignments
  async fetchAssignments(req: Req, res: Res, next: Next) {
    try {
      const courseId = req.query.courseId as string;
      const assignmentsData = await this._userUseCase.getAssignments(courseId);
      return res.status(assignmentsData.status).json(assignmentsData.data);
    } catch (error) {
      next(error);
    }
  }
  // getInstructor
  async getInstructor(req: Req, res: Res, next: Next) {
    try {
      const instructorId = req.query.instructorId as string;
      const instructorData = await this._userUseCase.getInstructorDetails(
        instructorId
      );
      return res.status(instructorData.status).json(instructorData.data);
    } catch (error) {
      next(error);
    }
  }
  // submitTheReport
  async submitTheReport(req: Req, res: Res, next: Next) {
    try {
      const { courseId, userId, formState } = req.body;
      const reportResponse = await this._userUseCase.reportingCourse(
        courseId,
        userId,
        formState
      );

      res.status(reportResponse.status).json(reportResponse);
    } catch (error) {
      next(error);
    }
  }

  // getRating
  async getRating(req: Req, res: Res, next: Next) {
    try {
      const getRate = await this._userUseCase.getRates();
      return res.status(getRate.status).json(getRate);
    } catch (error) {
      next(error);
    }
  }
  // getStudentInfo
  async getStudentInfo(req: Req, res: Res, next: Next) {
    try {
      const userId = req.query.userId as string;
      const userData = await this._userUseCase.getUser(userId);
      if (userData.status == 200) {
        return res.status(userData.status).json(userData.data?.data);
      } else {
        return res.status(userData.status).json(userData.data?.message);
      }
    } catch (error) {
      next(error);
    }
  }

  // updatedUserData
  async updatedUserData(req: CustomRequest, res: Res, next: Next) {
    try {
      const { userId, name, email, phoneNumber } = req.body;
      const profileImage = req.file;

      const saveData = await this._userUseCase.updateEditData(
        userId,
        name,
        email,
        phoneNumber,
        profileImage
      );

      if (saveData.status === 200) {
        return res.status(saveData.status).json({
          message: saveData.message,
          updatedUser: saveData.updatedUser,
        });
      } else {
        return res.status(saveData.status).json({ message: saveData.message });
      }
    } catch (error) {
      next(error);
    }
  }
  // changePassword
  async changePassword(req: Req, res: Res, next: Next) {
    try {
      const { userId, currentPassword, newPassword } = req.body;

      const result = await this._userUseCase.updatePassword(
        userId,
        currentPassword,
        newPassword
      );

      return res.status(result?.status).json(result);
    } catch (error) {
      next(error);
    }
  }

  // getCategories
  async getCategories(req: Req, res: Res, next: Next) {
    try {
      const categories = await this._userUseCase.getCategory();
      if (categories) {
        return res.status(categories.status).json(categories.data);
      }
    } catch (error) {
      next(error);
    }
  }

  // getHomePageData
  async getHomePageData(req: Req, res: Res, next: Next) {
    try {
      const getHomeData = await this._userUseCase.getDataToHome();
      return res.status(getHomeData.status).json(getHomeData);
    } catch (error) {
      next(error);
    }
  }
  // getEntrolledCourse
  async entrolledCourseGet(req: Req, res: Res, next: Next) {
    try {
      const userId = req.query.userId as string;
      const entrolledCourses = await this._userUseCase.enrolledCourseData(
        userId
      );

      return res.status(entrolledCourses.status).json(entrolledCourses.data);
    } catch (error) {
      next(error);
    }
  }
  // getInitialMsg
  async getInitialMsg(req: Req, res: Res, next: Next) {
    try {
      const senderId = req.query.senderId as string;
      const receiverId = req.query.receiverId as string;
      const initialMsgs = await this._userUseCase.getPreviousMsgs(
        senderId,
        receiverId
      );
      return res.status(initialMsgs.status).json(initialMsgs.data);
    } catch (error) {
      next(error);
    }
  }
  // getWallet
  async getWallet(req: Req, res: Res, next: Next) {
    try {
      const { userid } = req.query;
      const userId = req.query.userId as string;

      const wallet = await this._userUseCase.getWalletData(userId);

      return res.status(wallet.status).json(wallet);
    } catch (error) {
      next(error);
    }
  }
  // paymentWallet
  async paymentWallet(req: Req, res: Res, next: Next) {
    try {
      const { userId, instructorId, courseId, coursePrice, courseName } =
        req.body;

      const walletPaymentResult = await this._userUseCase.successWalletPayment(
        userId,
        instructorId,
        courseId,
        coursePrice,
        courseName
      );
      if (walletPaymentResult.status == 200) {
        return res.status(walletPaymentResult.status).json(walletPaymentResult);
      } else {
        return res.status(walletPaymentResult.status).json(walletPaymentResult);
      }
    } catch (error) {
      next(error);
    }
  }
}

export default userConroller;
