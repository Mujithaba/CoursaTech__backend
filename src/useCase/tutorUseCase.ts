import Tutor from "../domain/tutor";
import TutorRepository from "../infrastructure/repository/tutorRepository";
import GenerateOtp from "../infrastructure/services/generateOtp";
import GenerateMail from "../infrastructure/services/sendMailer";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import { VerifyData } from "./Interface/verifyData";
import JwtToken from "../infrastructure/services/generateToken";
import S3Uploader from "../infrastructure/services/s3BucketAWS";
import { IFile, courseInfo } from "../infrastructure/type/expressTypes";
import ICourse from "../domain/course/course";
import ICategory from "../domain/Icategory";
import Modules from "../domain/course/chapter";
import Module from "module";
import { title } from "process";

class TutorUseCase {
  private TutorRepository: TutorRepository;
  private EncryptPassword: EncryptPassword;
  private GenerateOtp: GenerateOtp;
  private GenerateMail: GenerateMail;
  private JwtToken: JwtToken;
  private S3Uploader: S3Uploader;

  constructor(
    tutorRepository: TutorRepository,
    encryptPassword: EncryptPassword,
    generateOtp: GenerateOtp,
    generateMail: GenerateMail,
    jwtToken: JwtToken,
    s3Uploader: S3Uploader,
  ) {
    this.TutorRepository = tutorRepository;
    this.EncryptPassword = encryptPassword;
    this.GenerateOtp = generateOtp;
    this.GenerateMail = generateMail;
    this.JwtToken = jwtToken;
    this.S3Uploader = s3Uploader;
  }

  //check email exist
  async checkExist(email: string) {
    const tutorExist = await this.TutorRepository.findByEmail(email);

    if (tutorExist) {
      return {
        status: 400,
        data: {
          status: false,
          message: "Tutor already exist;",
        },
      };
    } else {
      return {
        status: 200,
        data: {
          status: true,
          message: "Tutor does not exist;",
        },
      };
    }
  }

  //   tutor sign up
  async signup(name: string, email: string) {
    const otp = await this.GenerateOtp.createOtp();
    const role = "Tutor";
    console.log(otp, "otp");

    await this.TutorRepository.saveOtp(name, email, otp, role);
    this.GenerateMail.sendMail(name, email, otp, role);
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
    console.log(data.roleData, "tutor sucase otp");

    const otpDetailes = await this.TutorRepository.findOtpByEmail(
      data.roleData.email,
      data.role
    );
    console.log(otpDetailes, "jjjj");

    if (otpDetailes === null) {
      return { status: 400, message: "Invalid or expired OTP" };
    }

    if (otpDetailes.otp !== data.otp) {
      return { status: 400, message: "Invalid OTP" };
    }

    // if (otpDetailes.role !== role) {
    //   return {status:400,message:`No OTP found for ${role} with the provided email.`}
    // }
    return {
      status: 200,
      message: "OTP verificaton successfully",
      data: data.roleData,
    };
  }

  async saveTutor(tutor: Tutor) {
    console.log(tutor.password, "pass save ");

    const hashPassword = await this.EncryptPassword.encryptPassword(
      tutor.password as string
    );
    tutor.password = hashPassword;
    const userSave = await this.TutorRepository.saves(tutor);
    console.log(hashPassword, "pass hash");
    return {
      status: 201,
      data: userSave,
    };
  }

  //   login use case
  async login(email: string, password: string) {
    const tutor = await this.TutorRepository.findByEmail(email);
    let token = "";

    if (tutor) {
      let data = {
        _id: tutor._id,
        name: tutor.name,
        email: tutor.email,
        password: tutor.password,
        isBlock: tutor.isBlocked,
        isAdmin: tutor.isAdmin,
        isGoogle: tutor.isGoogle,
      };

      if (tutor.isBlocked) {
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
        tutor.password
      );

      if (passwordMatch) {
        token = this.JwtToken.generateToken(tutor._id, "tutor");
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
    const otp = this.GenerateOtp.createOtp();
    console.log(otp, "OTP");

    const role = "Tutor";
    await this.TutorRepository.saveOtp(name, email, otp, role);
    this.GenerateMail.sendMail(name, email, otp, role);

    return {
      status: 200,
      data: {
        status: true,
        message: " Resend otp sent to your email",
      },
    };
  }

  async forgotPassword(email: string) {
    const tutorExist = await this.TutorRepository.findByEmail(email);
    console.log(tutorExist, "data");

    if (tutorExist?.isGoogle) {
      return {
        status: 403,
        data: {
          status: false,
          message:
            "You cannot change the password because you used Google registration",
          tutorData: tutorExist,
        },
      };
    }

    if (tutorExist) {
      const otp = this.GenerateOtp.createOtp();
      const role = "Tutor";

      await this.GenerateMail.sendMail(
        tutorExist.name,
        tutorExist.email,
        otp,
        role
      );
      await this.TutorRepository.saveOtp(
        tutorExist.name,
        tutorExist.email,
        otp,
        role
      );

      return {
        status: 200,
        data: {
          status: true,
          message: "Verification OTP sent to your Email",
          tutorData: tutorExist,
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

    const hashPassword = await this.EncryptPassword.encryptPassword(
      password as string
    );
    const result = await this.TutorRepository.forgotPassUpdate(
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
        status: 200,
        message: "Something went wrong Password change,Please try later",
      };
    }
  }

  // taking userData by id
  async getUser(userId: string) {
    console.log("get user use case");

    const tutorData = await this.TutorRepository.findById(userId);
    if (tutorData) {
      return {
        status: 200,
        data: {
          message: "getting the instructor data",
          data: tutorData,
        },
      };
    } else {
      return {
        status: 400,
        message: "something went wrong getting the user data",
      };
    }
  }
  // basic course upload
  async uploadBasicInfo(
    thumbnail: Express.Multer.File,
    video: Express.Multer.File,
    courseInfo: courseInfo
  ): Promise<any> {
    console.log("Thumbnail file:", thumbnail);
    console.log("Video file:", video);
    const s3thumbnail = await this.S3Uploader.uploadImage(thumbnail);
    const s3TrailerVD = await this.S3Uploader.uploadVideo(video);
    console.log(s3TrailerVD, s3thumbnail, "kkk s3 bucket");
    const data: ICourse = {
      title: courseInfo.title,
      description: courseInfo.description,
      instructor_id: courseInfo.instructor_id,
      category_id: courseInfo.category,
      thambnail_Img: s3thumbnail,
      trailer_vd: s3TrailerVD,
      price: courseInfo.price,
    };
    const cousrseData = await this.TutorRepository.createCourse(data);
    console.log(cousrseData, "cousrseCreate use case");
    if (cousrseData) {
      return {
        status: 201,
        data: cousrseData,
      };
    }
  }

  // get categories
  async getCategory() {
    const getCateData = await this.TutorRepository.getCategory();
    if (getCateData) {
      return {
        status: 200,
        data: {
          getCateData,
        },
      };
    } else {
      return {
        status: 400,
        data: {
          message: "Something went wrong fetching category",
        },
      };
    }
  }

  async getCourses(instructor_id: string) {
    const getInstructorCourses =
      await this.TutorRepository.getInstructorCourses(instructor_id);
    // console.log(getInstructorCourses, "getInstructorCourses");
    const getTutorCourses = await this.s3GetFunction(getInstructorCourses);
    

    if (getTutorCourses) {
      return {
        status: 200,
        data: {
          getTutorCourses,
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

  // url thorugh data fetching from s3
  async s3GetFunction(getTutorCourses: any) {
    console.log("kkkk");
    const coursesWithSignedUrls = await Promise.all(
      getTutorCourses.map(async (course: any) => {
        let thumbnailUrl = "";
        let trailerUrl = "";

        if (course.thambnail_Img) {
          try {
            thumbnailUrl = await this.S3Uploader.getSignedUrl(
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
            trailerUrl = await this.S3Uploader.getSignedUrl(course.trailer_vd);
          } catch (error) {
            console.error(
              `Error generating signed URL for trailer: ${course.trailer_vd}`,
              error
            );
          }
        }

        const moduleWithSignedUrls = await Promise.all(
          (course.chapters || []).map(async (module:any)=>{
            const lecturewithSignedUrls = await Promise.all(
              (module.lectures || []).map(async (lecture:any)=>{
                let pdfUrl ='';
                let videoUrl ='';

                if (lecture.pdf) {
                  try {
                    pdfUrl = await this.S3Uploader.getSignedUrl(lecture.pdf)
                  } catch (error) {
                    console.error(`Error generating signed URL  for lecture pdf:${lecture.pdf}`,error);
                    
                  }
                }

                if (lecture.video) {
                  try {
                    videoUrl = await this.S3Uploader.getSignedUrl(lecture.video)
                  } catch (error) {
                    console.error(`error generating signed Url for lecture video:${lecture.video}`,error)
                  }
                }

                return {
                  ...lecture,
                  lecturePdf:pdfUrl,
                  lectureVideo:videoUrl,
                }

              })
            );

            return {
              ...module,
              name:module.name,
              lectures:lecturewithSignedUrls,
            }
          })
        );

        return {
          ...course,
          thumbnailSignedUrl: thumbnailUrl,
          trailerSignedUrl: trailerUrl,
          modules:moduleWithSignedUrls
        };
      })
    );

    return coursesWithSignedUrls;
  }

  // uplaoding curicculums
  async uploadCuricculum(
    course_id: string,
    modules: Modules[],
    files: Express.Multer.File[]
  ) {
    // console.log(course_id, modules, "usecase data ");
    const modules_IDs: string[] = [];
    const processedModulesIDs: any[] = [];
    for (const [moduleIndex, module] of modules.entries()) {
      const processedLecturesIDs: any[] = [];

      console.log("Module Data:", module);
      // console.log("Module Name:", module.name);

      if (module.lectures) {
       
        for (const [lectureIndex, lecture] of module.lectures.entries()) {
          // console.log("Lecture Data:", lecture);

          const videoFileName = `lectures[${moduleIndex}][${lectureIndex}].video`;
          const pdfFileName = `lectures[${moduleIndex}][${lectureIndex}].pdf`;

          const videoFile = files.find(
            (file) => file.fieldname === videoFileName
          );
          const pdfFile = files.find((file) => file.fieldname === pdfFileName);

          let videoUrl=''
          let pdfUrl = ''

          if (pdfFile) {
            // console.log("PDF File:", pdfFile);
            pdfUrl = await this.S3Uploader.uploadPDF(pdfFile)
           
          }
          if (videoFile) {
            // console.log("Video File:", videoFile);
            videoUrl = await this.S3Uploader.uploadVideo(videoFile)
            
          }


          const processedLecture = {
            course_id:course_id,
            title: lecture.title,
            description: lecture.description,
            video: videoUrl,
            pdf: pdfUrl,
          };

          const savedLecture =await this.TutorRepository.saveLectures(processedLecture)

          if (savedLecture) {
            processedLecturesIDs.push(savedLecture._id)
          }else{
            console.log("savedLecture is cause a error");
            
          }
        }

      }

      const processedModule ={
        course_id:course_id,
        name:module.name,
        lectures:processedLecturesIDs
      }
      const savedModuleID = await this.TutorRepository.saveModules(processedModule)
      if(savedModuleID){
        processedModulesIDs.push(savedModuleID)
      }else{
        console.log("savedModule cause a error");
        
      }

      
    }
    // save module id's to chapter field of array
    const curicculumData = await this.TutorRepository.saveModulesIdToChapter(course_id,processedModulesIDs)
    if (curicculumData) {
      console.log(curicculumData,"processed saved");
      return {
        status:200,
        data:{
          message:"Curicculum added successfully",
          data:curicculumData
        }
      }
    } else {
      console.log("something chapter updtion");
      return {
        status:400,
        data:{
        message:"Somehting went wrong when adding curicculum"
        }
      }
    }

  }

  // async getCurriculums(courseId:string){
  //   console.log(courseId,"use case of get curriculum");
    
  // }

  //individual getViewCourse
  async getViewCourse (course_id:string){
    const getCourses =
      await this.TutorRepository.getCourseView(course_id);
    console.log(getCourses, "getInstructorCourses");
    const getTutorCourses = await this.s3GenerateForViewCourse(getCourses);
    console.log(getTutorCourses, "aray s3 bucke");

    if (getTutorCourses) {
      return {
        status: 200,
        data: {
          getTutorCourses,
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
  async s3GenerateForViewCourse (course:any){
    console.log("Processing course...");

    let thumbnailUrl = "";
    let trailerUrl = "";
  
    if (course.thambnail_Img) {
      try {
        thumbnailUrl = await this.S3Uploader.getSignedUrl(course.thambnail_Img);
      } catch (error) {
        console.error(
          `Error generating signed URL for thumbnail: ${course.thambnail_Img}`,
          error
        );
      }
    }
  
    if (course.trailer_vd) {
      try {
        trailerUrl = await this.S3Uploader.getSignedUrl(course.trailer_vd);
      } catch (error) {
        console.error(
          `Error generating signed URL for trailer: ${course.trailer_vd}`,
          error
        );
      }
    }
  
    const moduleWithSignedUrls = await Promise.all(
      (course.chapters || []).map(async (module: any) => {
        const lecturewithSignedUrls = await Promise.all(
          (module.lectures || []).map(async (lecture: any) => {
            let pdfUrl = '';
            let videoUrl = '';
  
            if (lecture.pdf) {
              try {
                pdfUrl = await this.S3Uploader.getSignedUrl(lecture.pdf);
              } catch (error) {
                console.error(`Error generating signed URL for lecture PDF: ${lecture.pdf}`, error);
              }
            }
  
            if (lecture.video) {
              try {
                videoUrl = await this.S3Uploader.getSignedUrl(lecture.video);
              } catch (error) {
                console.error(`Error generating signed URL for lecture video: ${lecture.video}`, error);
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
}
export default TutorUseCase;
