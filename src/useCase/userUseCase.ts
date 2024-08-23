import User from "../domain/user";
import UserRepository from "../infrastructure/repository/userRepository";
import GenerateOtp from "../infrastructure/services/generateOtp";
import GenerateMail from "../infrastructure/services/sendMailer";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import { VerifyData } from "./Interface/verifyData";
import JwtToken from "../infrastructure/services/generateToken";
import S3Uploader from "../infrastructure/services/s3BucketAWS";
import Modules from "../domain/course/chapter";
import Lecture from "../domain/course/lecture";
import Razorpay from "razorpay";
import { log } from "util";
import { IConversation, IPaymentComplete, Message } from "../infrastructure/type/expressTypes";
import { IPayment } from "../domain/payment";
import items from "razorpay/dist/types/items";
import { Conversation } from "../domain/conversationMsg";

class UserUseCase {
  private _userRepository: UserRepository;
  private _encryptPassword: EncryptPassword;
  private _generateOtp: GenerateOtp;
  private _generateSendMail: GenerateMail;
  private _jwtToken: JwtToken;
  private _S3Uploader: S3Uploader;
  private _razorpay: Razorpay;
  constructor(
    userRepository: UserRepository,
    encryptPassword: EncryptPassword,
    generateOtp: GenerateOtp,
    generateSendMail: GenerateMail,
    jwtToken: JwtToken,
    s3Uploader: S3Uploader,
    razorpay: Razorpay
  ) {
    this._userRepository = userRepository;
    this._encryptPassword = encryptPassword;
    this._generateOtp = generateOtp;
    this._generateSendMail = generateSendMail;
    this._jwtToken = jwtToken;
    this._S3Uploader = s3Uploader;
    this._razorpay = razorpay;
  }

  // email exist checking when register
  async checkExist(email: string) {
    const userExist = await this._userRepository.findByEmail(email);

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
    const otp = this._generateOtp.createOtp();
    console.log(otp, "OTP");

    const role = "user";
    await this._userRepository.saveOtp(name, email, otp, role);
    this._generateSendMail.sendMail(name, email, otp, role);

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
    const otpDetailes = await this._userRepository.findOtpByEmail(
      data.roleData.email,
      data.role
    );

    if (otpDetailes === null) {
      return { status: 400, message: "Invalid or expired OTP" };
    }

    console.log(otpDetailes.otp, "l2222");

    if (otpDetailes.otp !== data.otp) {
      return { status: 400, message: "Invalid OTP" };
    }

    return {
      status: 200,
      message: "OTP verificaton successfully",
      data: data.roleData,
    };
  }

  async saveUser(user: User) {
    const hashPassword = await this._encryptPassword.encryptPassword(
      user.password as string
    );
    user.password = hashPassword;
    const userSave = await this._userRepository.saves(user);
    return {
      status: 201,
      data: userSave,
    };
  }

  async login(email: string, password: string) {
    const user = await this._userRepository.findByEmail(email);
    let token = "";

    if (user) {
      let data = {
        _id: user._id,
        name: user.name,
        email: user.email,
        // password: user.password,
        isBlock: user.isBlocked,
        isAdmin: user.isAdmin,
        isGoogle: user.isGoogle,
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

      const passwordMatch = await this._encryptPassword.compare(
        password,
        user.password
      );

      if (passwordMatch && user.isAdmin) {
        token = this._jwtToken.generateToken(user._id, "admin");

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
        token = this._jwtToken.generateToken(user._id, "user");
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

  async resend_otp(name: string, email: string) {
    const otp = this._generateOtp.createOtp();
    console.log(otp, "OTP");

    const role = "user";
    await this._userRepository.saveOtp(name, email, otp, role);
    this._generateSendMail.sendMail(name, email, otp, role);

    return {
      status: 200,
      data: {
        status: true,
        message: " Resend otp sent to your email",
      },
    };
  }

  async forgotPassword(email: string) {
    const userExist = await this._userRepository.findByEmail(email);
    console.log(userExist, "data");
    if (userExist?.isGoogle) {
      return {
        status: 403,
        data: {
          status: false,
          message:
            "You cannot change the password because you used Google registration",
          userData: userExist,
        },
      };
    }

    if (userExist) {
      const otp = this._generateOtp.createOtp();
      const role = "user";

      await this._generateSendMail.sendMail(
        userExist.name,
        userExist.email,
        otp,
        role
      );
      await this._userRepository.saveOtp(
        userExist.name,
        userExist.email,
        otp,
        role
      );

      return {
        status: 200,
        data: {
          status: true,
          message: "Verification OTP sent to your Email",
          userData: userExist,
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

  async resetPassword(email: string, password: string) {
    console.log(email, "kkkkoi");

    const hashPassword = await this._encryptPassword.encryptPassword(
      password as string
    );
    const result = await this._userRepository.forgotPassUpdate(
      email,
      hashPassword
    );
    if (result) {
      return {
        status: 200,
        message: "Password changed successfully",
      };
    } else {
      return {
        status: 400,
        message: "Something went wrong Password change,Please try later",
      };
    }
  }

  // taking userData by id
  async getUser(userId: string) {
    console.log("get user use case");

    const userData = await this._userRepository.findById(userId);
    if (userData) {
      return {
        status: 200,
        data: {
          message: " getting the user data",
          data: userData,
        },
      };
    } else {
      return {
        status: 400,
        message: "something went wrong getting the user data",
      };
    }
  }

  // get all courses
  async allCourseGet(limit: number, skip: number) {
    const courses = await this._userRepository.getCourses(limit, skip);
    const getCourses = await this.s3GetFunction(courses);
    if (getCourses) {
      return {
        status: 200,
        data: {
          getCourses,
        },
      };
    } else {
      return {
        status: 400,
        data: {
          message: "Something went wrong fetching courses",
        },
      };
    }
  }
  
  async countCourses(){
    const itemsCount = await this._userRepository.coursesCount()
    return itemsCount
  }
  
 
  // url thorugh data fetching from s3
  async s3GetFunction(getCourses: {}[]) {
    console.log("kkkk");
    const coursesWithSignedUrls = await Promise.all(
      getCourses.map(async (course: any) => {
        let thumbnailUrl = "";
        let trailerUrl = "";

        if (course.thambnail_Img) {
          try {
            thumbnailUrl = await this._S3Uploader.getSignedUrl(
              course.thambnail_Img
            );
          } catch (error) {
            console.error(
              `Error generating signed URL for thumbnail: ${course.thambnail_Img}`,
              error
            );
          }
        }

        if (course.trailer_vd) {
          try {
            trailerUrl = await this._S3Uploader.getSignedUrl(course.trailer_vd);
          } catch (error) {
            console.error(
              `Error generating signed URL for trailer: ${course.trailer_vd}`,
              error
            );
          }
        }

        const moduleWithSignedUrls = await Promise.all(
          (course.chapters || []).map(async (module: Modules) => {
            const lecturewithSignedUrls = await Promise.all(
              (module.lectures || []).map(async (lecture: Lecture) => {
                let pdfUrl = "";
                let videoUrl = "";

                if (lecture.pdf) {
                  try {
                    pdfUrl = await this._S3Uploader.getSignedUrl(lecture.pdf);
                  } catch (error) {
                    console.error(
                      `Error generating signed URL  for lecture pdf:${lecture.pdf}`,
                      error
                    );
                  }
                }

                if (lecture.video) {
                  try {
                    videoUrl = await this._S3Uploader.getSignedUrl(
                      lecture.video
                    );
                  } catch (error) {
                    console.error(
                      `error generating signed Url for lecture video:${lecture.video}`,
                      error
                    );
                  }
                }

                return {
                  ...lecture,
                  lecturePdf: pdfUrl,
                  lectureVideo: videoUrl,
                };
              })
            );

            return {
              ...module,
              name: module.name,
              lectures: lecturewithSignedUrls,
            };
          })
        );

        return {
          ...course,
          thumbnailSignedUrl: thumbnailUrl,
          trailerSignedUrl: trailerUrl,
          modules: moduleWithSignedUrls,
        };
      })
    );

    return coursesWithSignedUrls;
  }

  //individual getViewCourse
  async getViewCourse(course_id: string,userid:string) {
    const {getCourses,isPurchased} = await this._userRepository.getCourseView(course_id,userid);
    const getViewCourses = await this.s3GenerateForViewCourse(getCourses);
    // console.log(getViewCourses, "aray s3 bucke");

    if (getViewCourses) {
      return {
        status: 200,
        data: {
          getViewCourses,
          isPurchased
        },
      };
    } else {
      return {
        status: 400,
        data: {
          message: "Something went wrong fetching courses",
        },
      };
    }
  }
  // individual courseview
  async s3GenerateForViewCourse(course: any) {
    console.log("Processing course...");

    let thumbnailUrl = "";
    let trailerUrl = "";

    if (course.thambnail_Img) {
      try {
        thumbnailUrl = await this._S3Uploader.getSignedUrl(course.thambnail_Img);
      } catch (error) {
        console.error(
          `Error generating signed URL for thumbnail: ${course.thambnail_Img}`,
          error
        );
      }
    }

    if (course.trailer_vd) {
      try {
        trailerUrl = await this._S3Uploader.getSignedUrl(course.trailer_vd);
      } catch (error) {
        console.error(
          `Error generating signed URL for trailer: ${course.trailer_vd}`,
          error
        );
      }
    }

    const moduleWithSignedUrls = await Promise.all(
      (course.chapters || []).map(async (module: Modules) => {
        const lecturewithSignedUrls = await Promise.all(
          (module.lectures || []).map(async (lecture: Lecture) => {
            let pdfUrl = "";
            let videoUrl = "";

            if (lecture.pdf) {
              try {
                pdfUrl = await this._S3Uploader.getSignedUrl(lecture.pdf);
              } catch (error) {
                console.error(
                  `Error generating signed URL for lecture PDF: ${lecture.pdf}`,
                  error
                );
              }
            }

            if (lecture.video) {
              try {
                videoUrl = await this._S3Uploader.getSignedUrl(lecture.video);
              } catch (error) {
                console.error(
                  `Error generating signed URL for lecture video: ${lecture.video}`,
                  error
                );
              }
            }

            return {
              ...lecture,
              lecturePdf: pdfUrl,
              lectureVideo: videoUrl,
            };
          })
        );

        return {
          ...module,
          name: module.name,
          lectures: lecturewithSignedUrls,
        };
      })
    );

    return {
      ...course,
      thumbnailSignedUrl: thumbnailUrl,
      trailerSignedUrl: trailerUrl,
      modules: moduleWithSignedUrls,
    };
  }

  // create course
  async createPyment(courseId: string) {
    console.log("course paymnet use case", courseId);
    const courseData = await this._userRepository.findCourseById(courseId);

    const price: string = courseData?.price?.toString() || "0";

    const amountInPaise = parseInt(price);

    const options = {
      amount: amountInPaise * 100,
      currency: "INR",
      receipt: `receipt_${courseId}`,
      payment_capture: 1,
    };
    const response = await this._razorpay.orders.create(options);
    return {
      response,
    };
  }
  // successPayment
  async successPayment(data: IPaymentComplete) {
    const courseData = await this._userRepository.findCourseById(data.courseID);
    const paymentData: IPayment = {
      userId: data.userID,
      courseId: data.courseID,
      price: courseData?.price as string,
    };
    const savePayment = await this._userRepository.savePayments(paymentData);
    console.log(savePayment, "savePayment");
    if (savePayment) {
      return {
        status: 200,
        message: "Payment successfully completed",
      };
    } else {
      return {
        status: 400,
        message: "Something went wrong in the payment,Please Check that",
      };
    }
  }
  // storeUserMsg
  async storeUserMsg(message:string,userId:string,instructorId:string,username:string){
    const msg:Message = {
      senderId:userId,
      receiverId:instructorId,
      message:message
    }
    const storeMsg = await this._userRepository.storeMesssage(msg)
    let lastMsg:Conversation={
      senderName:username,
      senderId:userId,
      receiverId:instructorId,
      lastMessage:message
    }
    const conversationMsg = await this._userRepository.createConversation(lastMsg)
    console.log(storeMsg,conversationMsg,"stored msg");

    if (storeMsg) {
      return {
        status:200,
        message:"msg is stored"
      }
    } else {
      return {
        status:400,
        message:"something went wrong the msg storing"
      }
    }
    
  }
}

export default UserUseCase;
