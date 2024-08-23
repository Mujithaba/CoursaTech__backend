import { log } from "console";
import { Req, Res, Next, IFile } from "../infrastructure/type/expressTypes";
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
  async verifyOTP(req: Req, res: Res, next: Next) {
    try {
      const data: VerifyData = req.body;
      const OTPverification = await this.tutorUseCase.verify(data);

      if (OTPverification.status == 400) {
        return res
          .status(OTPverification.status)
          .json({ message: OTPverification.message });
      }

      if (OTPverification.data && OTPverification.status == 200) {
        const savedTutor = await this.tutorUseCase.saveTutor(
          OTPverification.data
        );
        res
          .status(200)
          .json({ message: "Tutor saved successfully", data: savedTutor });
      }
    } catch (error) {
      next(error);
    }
  }

  // login
  async login(req: Req, res: Res, next: Next) {
    try {
      const { email, password } = req.body;

      const user = await this.tutorUseCase.login(email, password);
      return res.status(user.status).json(user.data);
    } catch (error) {
      next(error);
    }
  }

  // resendOTP
  async resendOtp(req: Req, res: Res, next: Next) {
    try {
      const { name, email } = req.body;

      const resendOTP = await this.tutorUseCase.resend_otp(name, email);
      return res.status(resendOTP.status).json(resendOTP.data);
    } catch (error) {
      next(error);
    }
  }

  // google sign up or login
  async googleUse(req: Req, res: Res, next: Next) {
    try {
      const { name, email, phone, password, isGoogled } = req.body;

      const checkExist = await this.tutorUseCase.checkExist(email);

      if (checkExist.data.status == true) {
        const data = {
          name: name,
          email: email,
          phone: phone,
          password: password,
          isGoogle: isGoogled,
        };

        await this.tutorUseCase.saveTutor(data);
        const tutor = await this.tutorUseCase.login(email, password);
        return res.status(tutor.status).json(tutor.data);
      } else if (checkExist.data.status == false) {
        const user = await this.tutorUseCase.login(email, password);
        return res.status(user.status).json(user.data);
      }
    } catch (error) {
      next(error);
    }
  }

  // forgotpassword
  async forgotPass(req: Req, res: Res, next: Next) {
    try {
      const email = req.body.email;
      console.log(email, "email fgt");

      const tutor = await this.tutorUseCase.forgotPassword(email);

      if (tutor.status == 403) {
        return res.status(tutor.status).json(tutor.data);
      } else if (tutor.status == 200) {
        return res.status(tutor.status).json(tutor.data);
      } else {
        return res.status(tutor.status).json(tutor.data);
      }
    } catch (error) {
      next(error);
    }
  }

  // forgot pass otp verify
  async forgotOTPverify(req: Req, res: Res, next: Next) {
    try {
      const data: VerifyData = req.body;
      console.log(data, "ppp");

      const verify = await this.tutorUseCase.verify(data);
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

      const result = await this.tutorUseCase.resetPassword(email, password);
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
  async dashboardPage(req: Req, res: Res, next: Next) {
    try {
      console.log(req.query.id, "tutor id in controller");
      const tutorId = req.query.id as string;

      const tutor = await this.tutorUseCase.getUser(tutorId);
      console.log(tutor);

      if (tutor.status == 200) {
        return res.status(tutor.status).json(tutor.data?.data);
      } else {
        return res.status(tutor.status).json(tutor.data?.message);
      }
    } catch (error) {
      next(error);
    }
  }

  // course basic info save
  async courseBasicInfoSave(req: Req, res: Res, next: Next) {
    try {
      // console.log(req.body.instructor_id,"data");
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const thumbnailFiles = files["thumbnail"];
      const videoFiles = files["video"];

      const thumbnail = thumbnailFiles[0];
      const video = videoFiles[0];
      const { title, description, instructor_id, category, price } = req.body;
      const courseInfo = { title, description, instructor_id, category, price };

      const basicsData = await this.tutorUseCase.uploadBasicInfo(
        thumbnail,
        video,
        courseInfo
      );

      if (basicsData) {
        return res.status(basicsData.status).json({
          message: "Course created successfully,Now you can add modules",
          data: basicsData,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Req, res: Res, next: Next) {
    try {
      const categories = await this.tutorUseCase.getCategory();
      if (categories) {
        return res.status(categories.status).json(categories.data);
      }
    } catch (error) {
      next(error);
    }
  }

  // get instructors courses
  async getInstructorCourses(req: Req, res: Res, next: Next) {
    try {
      console.log("coming to instructor course");
      
      const id = req.query.id as string;
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const instructorCourses = await this.tutorUseCase.getCourses(id,Number(limit), skip);
      if (instructorCourses) {
        const totalItems = await this.tutorUseCase.countCourses(id);
        console.log(totalItems,"total");
        
        return res.status(instructorCourses.status).json({ ...instructorCourses.data, totalItems });
      } else {
        return res.status(404).json({ message: "No courses found" });
      }
    } catch (error) {
      next(error);
    }
  }

  // uploading Curicculum
  async uploadingCuricculum(req: Req, res: Res, next: Next) {
    try {
      console.log("curicculum");

      
      const course_id = req.body.course_id;
      const modules = JSON.parse(req.body.modules);
      // console.log(course_id, modules, "llllllooooiiiiqqq");
  
     
      const files = req.files as Express.Multer.File[];
  
      if (!Array.isArray(modules) || !course_id) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const uploadData = await this.tutorUseCase.uploadCuricculum(
        course_id,
        modules,
        files
      );
  
      return res.status(uploadData.status).json(uploadData.data)
    } catch (error) {
      console.error("Error in uploadingCuricculum:", error); 
      next(error); 
    }
  }

  async getViewCourse (req:Req,res:Res,next:Next){
    try {
      console.log("getViewCourse controller");
      const id = req.query.id as string
      console.log( id,"getViewCourse controller");
      const courseViewData = await this.tutorUseCase.getViewCourse(id);

      if (courseViewData) {
        return res
          .status(courseViewData.status)
          .json(courseViewData.data);
      } else {
        return res.status(404).json({ message: "No course found" });
      }
      
      
    } catch (error) {
      next(error)
    }
  }
// profile data fetching
  async fetchtutorDetails (req:Req,res:Res,next:Next){
    try {
      const tutorID = req.query.tutorID as string 
      const getInstructorDetails = await this.tutorUseCase.getInstructorData(tutorID)
      if (getInstructorDetails) {
        return res.status(getInstructorDetails.status).json(getInstructorDetails)
      }
      
    } catch (error) {
      next(error)
    }
  }
  //profileDataSave
  async profileDataSave (req:Req,res:Res,next:Next){
    try {
      const {registerData,instructorProfile} = req.body ;
      console.log(registerData,instructorProfile,"{registerData,instructorProfile}");
      const saveProfileDatas = await this.tutorUseCase.saveProfileDetailes(registerData,instructorProfile)
      if (saveProfileDatas) {
        return res.status(saveProfileDatas.status).json(saveProfileDatas)
      }
      
    } catch (error) { 
      next(error)
    }
  }

  // storedMsgsFetching
  async storedMsgFetching(req:Req,res:Res,next:Next){
    try {
      const instructorid = req.query.instructorId  as string
      console.log(instructorid,"oooooo");
      
      const conversationReceiver = await this.tutorUseCase.receiverConversations(instructorid)
     if (conversationReceiver) {
      return res.status(conversationReceiver.status).json(conversationReceiver)
     }
    } catch (error) {
      next(error)
    }
  }
  // coursesForAssignment
  async coursesForAssignment(req:Req,res:Res,next:Next){
    try {
      
      const instructorId = req.query.instructorId as string
      console.log(instructorId,"coursesForAssignment");
      const courseDatas = await this.tutorUseCase.fetchInstructorCourses(instructorId)
      if (courseDatas) {
        return res.status(courseDatas.status).json(courseDatas)
      }

    } catch (error) {
      next(error)
    }
  }
}
export default TutorController;
