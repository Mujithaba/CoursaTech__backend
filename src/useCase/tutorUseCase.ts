import Tutor from "../domain/tutor";
import TutorRepository from "../infrastructure/repository/tutorRepository";
import GenerateOtp from "../infrastructure/services/generateOtp";
import GenerateMail from "../infrastructure/services/sendMailer";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import { VerifyData } from "./Interface/verifyData";
import JwtToken from "../infrastructure/services/generateToken";
import S3Uploader from "../infrastructure/services/s3BucketAWS";
import {
  IFile,
  Message,
  Next,
  Req,
  Res,
  TutorDetails,
  courseInfo,
} from "../infrastructure/type/expressTypes";
import ICourse from "../domain/course/course";
import Modules from "../domain/course/chapter";
import Lecture from "../domain/course/lecture";
import { log, time } from "console";
import { ITutorDetails } from "../domain/tutorDetails";
import { Conversation } from "../domain/conversationMsg";

class TutorUseCase {
  private _tutorRepository: TutorRepository;
  private _encryptPassword: EncryptPassword;
  private _generateOtp: GenerateOtp;
  private _generateMail: GenerateMail;
  private _jwtToken: JwtToken;
  private _S3Uploader: S3Uploader;

  constructor(
    tutorRepository: TutorRepository,
    encryptPassword: EncryptPassword,
    generateOtp: GenerateOtp,
    generateMail: GenerateMail,
    jwtToken: JwtToken,
    s3Uploader: S3Uploader
  ) {
    this._tutorRepository = tutorRepository;
    this._encryptPassword = encryptPassword;
    this._generateOtp = generateOtp;
    this._generateMail = generateMail;
    this._jwtToken = jwtToken;
    this._S3Uploader = s3Uploader;
  }

  //check email exist
  async checkExist(email: string) {
    const tutorExist = await this._tutorRepository.findByEmail(email);

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
    const otp = await this._generateOtp.createOtp();
    const role = "Tutor";
    console.log(otp, "otp");

    await this._tutorRepository.saveOtp(name, email, otp, role);
    this._generateMail.sendMail(name, email, otp, role);
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

    const otpDetailes = await this._tutorRepository.findOtpByEmail(
      data.roleData.email,
      data.role
    );
    console.log(otpDetailes);

    if (otpDetailes === null) {
      return { status: 400, message: "Invalid or expired OTP" };
    }

    if (otpDetailes.otp !== data.otp) {
      return { status: 400, message: "Invalid OTP" };
    }

    return {
      status: 200,
      message: "OTP verificaton successfully",
      data: data.roleData,
    };
  }

  async saveTutor(tutor: Tutor) {
    console.log(tutor.password, "pass save ");

    const hashPassword = await this._encryptPassword.encryptPassword(
      tutor.password as string
    );
    tutor.password = hashPassword;
    const userSave = await this._tutorRepository.saves(tutor);
    console.log(hashPassword, "pass hash");
    return {
      status: 201,
      data: userSave,
    };
  }

  //   login use case
  async login(email: string, password: string) {
    const tutor = await this._tutorRepository.findByEmail(email);
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

      const passwordMatch = await this._encryptPassword.compare(
        password,
        tutor.password
      );

      if (passwordMatch) {
        token = this._jwtToken.generateToken(tutor._id, "tutor");
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

    const role = "Tutor";
    await this._tutorRepository.saveOtp(name, email, otp, role);
    this._generateMail.sendMail(name, email, otp, role);

    return {
      status: 200,
      data: {
        status: true,
        message: " Resend otp sent to your email",
      },
    };
  }

  async forgotPassword(email: string) {
    const tutorExist = await this._tutorRepository.findByEmail(email);
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
      const otp = this._generateOtp.createOtp();
      const role = "Tutor";

      await this._generateMail.sendMail(
        tutorExist.name,
        tutorExist.email,
        otp,
        role
      );
      await this._tutorRepository.saveOtp(
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

    const hashPassword = await this._encryptPassword.encryptPassword(
      password as string
    );
    const result = await this._tutorRepository.forgotPassUpdate(
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

    const tutorData = await this._tutorRepository.findById(userId);
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
  ) {
    console.log("Thumbnail file:", thumbnail);
    console.log("Video file:", video);
    const s3thumbnail = await this._S3Uploader.uploadImage(thumbnail);
    const s3TrailerVD = await this._S3Uploader.uploadVideo(video);
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
    const cousrseData = await this._tutorRepository.createCourse(data);
    console.log(cousrseData, "cousrseCreate use case$$$$$$$$$$$$$$$$$$");
    if (cousrseData) {
      return {
        status: 201,
        data: cousrseData,
      };
    }
  }

  // get categories
  async getCategory() {
    const getCateData = await this._tutorRepository.getCategory();
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

  async getCourses(instructor_id: string, limit: number, skip: number) {
    const getInstructorCourses =
      await this._tutorRepository.getInstructorCourses(
        instructor_id,
        limit,
        skip
      );
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
  async countCourses(id: string) {
    const itemsCount = await this._tutorRepository.coursesCount(id);
    return itemsCount;
  }

  // url thorugh data fetching from s3
  async s3GetFunction(getTutorCourses: {}[]) {
    console.log("kkkk");
    const coursesWithSignedUrls = await Promise.all(
      getTutorCourses.map(async (course: any) => {
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

  // uplaoding curicculums
  async uploadCuricculum(
    course_id: string,
    modules: Modules[],
    files: Express.Multer.File[]
  ) {
    // console.log(course_id, modules, "usecase data ");
    const modules_IDs: string[] = [];
    const processedModulesIDs: Modules[] = [];
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

          let videoUrl = "";
          let pdfUrl = "";

          if (pdfFile) {
            // console.log("PDF File:", pdfFile);
            pdfUrl = await this._S3Uploader.uploadPDF(pdfFile);
          }
          if (videoFile) {
            // console.log("Video File:", videoFile);
            videoUrl = await this._S3Uploader.uploadVideo(videoFile);
          }

          const processedLecture = {
            course_id: course_id,
            title: lecture.title,
            description: lecture.description,
            video: videoUrl,
            pdf: pdfUrl,
          };

          const savedLecture = await this._tutorRepository.saveLectures(
            processedLecture
          );

          if (savedLecture) {
            processedLecturesIDs.push(savedLecture._id);
          } else {
            console.log("savedLecture is cause a error");
          }
        }
      }

      const processedModule = {
        course_id: course_id,
        name: module.name,
        lectures: processedLecturesIDs,
      };
      const savedModuleID = await this._tutorRepository.saveModules(
        processedModule
      );
      if (savedModuleID) {
        processedModulesIDs.push(savedModuleID);
      } else {
        console.log("savedModule cause a error");
      }
    }
    // save module id's to chapter field of array
    const curicculumData = await this._tutorRepository.saveModulesIdToChapter(
      course_id,
      processedModulesIDs
    );
    if (curicculumData) {
      console.log(curicculumData, "processed saved");
      return {
        status: 200,
        data: {
          message: "Curicculum added successfully",
          data: curicculumData,
        },
      };
    } else {
      console.log("something chapter updtion");
      return {
        status: 400,
        data: {
          message: "Somehting went wrong when adding curicculum",
        },
      };
    }
  }

  //individual getViewCourse
  async getViewCourse(course_id: string) {
    const getCourses = await this._tutorRepository.getCourseView(course_id);
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
  async s3GenerateForViewCourse(course: ICourse) {
    console.log("Processing course...");

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
  // fetching profile data
  // async getInstructorData(tutor_id: string) {
  //   console.log(tutor_id, "tutorId");
  //   const getInstructorDetails = await this._tutorRepository.findById(tutor_id);
  //   console.log(getInstructorDetails, "isnturcto");
  //   let existDetailsDocument =
  //     await this._tutorRepository.instructorDetailsExistId(tutor_id);
  //   if (!existDetailsDocument) {
  //     let data: ITutorDetails = {
  //       instructorId: tutor_id,
  //       profileImg: "nopic",
  //       experience: "Please give your experience",
  //       position: "Please give your role",
  //       companyName: "Please give Company",
  //       aboutBio: "write something about yousrelf",
  //     };
  //     existDetailsDocument =
  //       await this._tutorRepository.uploadInstructorDetails(data);
  //   }
  //   if (getInstructorDetails && existDetailsDocument) {
  //     if (existDetailsDocument.profileImg != "nopic") {

  //       const imgUrl = await this._S3Uploader.getSignedUrl(existDetailsDocument.profileImg as string)
  //       existDetailsDocument.ProfileImgUrl = imgUrl
  //     }
  //     return {
  //       status: 200,
  //       data: {
  //         getInstructorDetails,
  //         existDetailsDocument,
  //       },
  //     };
  //   } else {
  //     return {
  //       status: 400,
  //       data: {
  //         message: "Something went wrong the fetching instructor data!",
  //       },
  //     };
  //   }
  // }
  async getInstructorData(tutor_id: string) {
    try {
      console.log(tutor_id, "tutorId");

      const getInstructorDetails = await this._tutorRepository.findById(
        tutor_id
      );
      console.log(getInstructorDetails, "instructorDetails");

      let existDetailsDocument =
        await this._tutorRepository.instructorDetailsExistId(tutor_id);

      if (!existDetailsDocument) {
        let data: ITutorDetails = {
          instructorId: tutor_id,
          profileImg: "nopic",
          experience: "Please give your experience",
          position: "Please give your role",
          companyName: "Please give Company",
          aboutBio: "Write something about yourself",
        };
        existDetailsDocument =
          await this._tutorRepository.uploadInstructorDetails(data);
      }

      let profileImgUrl: string | undefined = undefined;
      if (getInstructorDetails && existDetailsDocument) {
        if (existDetailsDocument.profileImg !== "nopic") {
          const imgUrl = await this._S3Uploader.getSignedUrl(
            existDetailsDocument.profileImg as string
          );
          profileImgUrl = imgUrl;
        }

        return {
          status: 200,
          data: {
            getInstructorDetails,
            existDetailsDocument,
            profileImgUrl,
          },
        };
      } else {
        return {
          status: 400,
          data: {
            message: "Something went wrong with fetching instructor data!",
          },
        };
      }
    } catch (error) {
      console.error("Error fetching instructor data:", error);
      return {
        status: 500,
        data: {
          message: "Internal server error",
        },
      };
    }
  }

  // save profile data
  async saveProfileDetailes(
    registerData: Tutor,
    instructorDetails: TutorDetails
  ) {
    console.log(registerData, instructorDetails, "instructorDetails usecase");
    const updateRegister = await this._tutorRepository.updateTheRegister(
      registerData
    );
    const updateInstructorDetails =
      await this._tutorRepository.updateTheInstructorDetails(instructorDetails);

    if (updateRegister || updateInstructorDetails) {
      return {
        status: 200,
        message: "SuccessFully updated",
      };
    } else {
      return {
        status: 400,
        message: "Something went wrong the updation...!",
      };
    }
  }

  // receiverConversations
  async receiverConversations(instructor_id: string) {
    const conversationLists =
      await this._tutorRepository.findConversationsByReceiverId(instructor_id);


    if (conversationLists) {
      return {
        status: 200,
        data: {
          conversationLists,
        },
      };
    } else {
      return {
        status: 400,
        data: {
          message: "Something went wrong fetching conversations",
        },
      };
    }
  }

  // fetchInstructorCourses
  async fetchInstructorCourses(instructor_id: string) {
    console.log(instructor_id, "instructor id for fetch courseName and Id");
    const fetchCourses = await this._tutorRepository.instructorCourseData(
      instructor_id
    );
    if (fetchCourses) {
      console.log(fetchCourses, "course names and id");
      return {
        status: 200,
        data: {
          fetchCourses,
        },
      };
    } else {
      return {
        status: 400,
        message: "Something went wrong fetching the course data",
      };
    }
  }
  // uploadAssignment
  async uploadAssignment(
    course_id: string,
    courseTitle: string,
    assignment?: Express.Multer.File | undefined
  ) {
    console.log(course_id, courseTitle, assignment, "uploadAssignment");
    if (!assignment) {
      throw new Error("No assignment file provided");
    }

    const pdfUrl = await this._S3Uploader.uploadPDF(assignment);
    const upload = await this._tutorRepository.addAssignment(
      course_id,
      courseTitle,
      pdfUrl
    );
    if (upload) {
      return {
        status: 200,
        message: "Assignment uploaded successfully",
      };
    } else {
      return {
        status: 400,
        message: "Something went wrong uploading assignment",
      };
    }
  }

  // fetchingAssignments
  async fetchingAssignments(instructor_id: string) {
    const assignmentsData = await this._tutorRepository.findAssignments(
      instructor_id
    );

    const assignmentsWithUrlPromises = assignmentsData.map(
      async (assignment) => {
        const assignmentUrl = await this._S3Uploader.getSignedUrl(
          assignment.pdf_file
        );
        return {
          ...assignment,
          assignmentUrl,
        };
      }
    );

    const assignmentsWithUrls = await Promise.all(assignmentsWithUrlPromises);

    return {
      status: 200,
      data: assignmentsWithUrls,
    };
  }

  // reviewsFetch
  async reviewsFetch(courseId: string) {
    console.log(courseId, "revie cour id");

    const getReviews = await this._tutorRepository.getReview(courseId);
    if (getReviews) {
      return {
        status: 200,
        data: {
          getReviews,
        },
      };
    } else {
      return {
        status: 400,
        data: {
          message: "Something went wrong fetching reviews",
        },
      };
    }
  }
  // getAssignments
  async getAssignments(courseId: string) {
    const assignmentsFetch = await this._tutorRepository.fetchAssignments(
      courseId
    );
    console.log(assignmentsFetch);

    const assignmentsWithUrlPromises = assignmentsFetch.map(
      async (assignment) => {
        const assignmentUrl = await this._S3Uploader.getSignedUrl(
          assignment.pdf_file
        );
        return {
          ...assignment,
          assignmentUrl,
        };
      }
    );

    const assignmentsWithUrls = await Promise.all(assignmentsWithUrlPromises);
    console.log(assignmentsWithUrls, assignmentsWithUrls);

    return {
      status: 200,
      data: assignmentsWithUrls,
    };
  }
  // getInstructorDetails
  async getInstructorDetails(instructorId: string) {
    const getInstructor = await this._tutorRepository.fetchInstructor(
      instructorId
    );
    return {
      status: 200,
      data: getInstructor,
    };
  }

  // dashboardFetch
  async dashboardFetch(instructorId: string) {
    const totalEarnings = await this._tutorRepository.getTotalEarnings(
      instructorId
    );
    const totalStudents = await this._tutorRepository.getTotalStudents(
      instructorId
    );
    const activeCourses = await this._tutorRepository.getActiveCourses(
      instructorId
    );
    const recentEnrollments = await this._tutorRepository.getRecentEnrollments(
      instructorId
    );
    const coursePerformance = await this._tutorRepository.getCoursePerformance(
      instructorId
    );
    const getCourseGrowth = await this._tutorRepository.getCourseGrowth(
      instructorId
    );

    return {
      status: 200,
      data: {
        totalEarnings,
        totalStudents,
        activeCourses,
        recentEnrollments,
        coursePerformance,
        getCourseGrowth,
      },
    };
  }
  // courseGrowth
  async courseGrowth(instructorId: string) {
    const getCourseGrowth = await this._tutorRepository.getCourseGrowth(
      instructorId
    );
    return {
      status: 200,
      data: {
        getCourseGrowth,
      },
    };
  }
  // updateProfileDp
  async updateProfileDp(instructorID: string, file: Express.Multer.File) {
    const newImage = await this._S3Uploader.uploadImage(file);
    const findInstructor =
      await this._tutorRepository.findByIdInstructorDetailsAndUpdate(
        instructorID,
        newImage
      );
    console.log(findInstructor, "findInstructor");
    if (findInstructor) {
      const newImageUrl = await this._S3Uploader.getSignedUrl(
        findInstructor.profileImg as string
      );
      return {
        status: 200,
        data: newImageUrl,
      };
    } else {
      return {
        status: 400,
        data: "something went wrong updating profile img",
      };
    }
  }
  // storeUserMsg
  async storeUserMsg(
    message: string,
    instructorId: string,
    userId: string,
    instructorName: string
  ) {
    const msg: Message = {
      senderId: instructorId,
      receiverId: userId,
      message: message,
    };
    const storeMsg = await this._tutorRepository.storeMesssage(msg);
    let lastMsg: Conversation = {
      senderName: instructorName,
      senderId: instructorId,
      receiverId: userId,
      lastMessage: message,
    };
    const conversationMsg = await this._tutorRepository.createConversation(
      lastMsg
    );
    console.log(storeMsg, conversationMsg, "stored msg");

    if (storeMsg) {
      return {
        status: 200,
        message: "msg is stored",
      };
    } else {
      return {
        status: 400,
        message: "something went wrong the msg storing",
      };
    }
  }
   // getPreviousMsgs
   async getPreviousMsgs(senderId:string,receiverId:string){
    const getInitialMsgs = await this._tutorRepository.getMsgs(senderId,receiverId)
    console.log(getInitialMsgs,"getPreviousMsgs");
    return {
      status:200,
      data:getInitialMsgs
    }
  }
}
export default TutorUseCase;
