import ICategory from "../domain/Icategory";
import AdminRepository from "../infrastructure/repository/adminRepository";
import GenerateMail from "../infrastructure/services/sendMailer";
import S3Uploader from "../infrastructure/services/s3BucketAWS";
import Modules from "../domain/course/chapter";
import Lecture from "../domain/course/lecture";

class AdminUseCase {
  private _generateMail: GenerateMail;
  private _adminRepository: AdminRepository;
  private _S3Uploader: S3Uploader;
  constructor(
    adminRepository: AdminRepository,
    generateMail: GenerateMail,
    s3Uploader: S3Uploader
  ) {
    this._adminRepository = adminRepository;
    this._generateMail = generateMail;
    this._S3Uploader = s3Uploader;
  }

  async usersData(page: number, limit: number) {
    const { users, totalUsers } = await this._adminRepository.findUsers(
      page,
      limit
    );
    if (users !== null) {
      return {
        status: 200,
        data: {
          users,
          totalUsers,
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "Something went wrong, unable to fetch users",
        },
      };
    }
  }

  // block user
  async userBlock(user_id: string) {
    const result = await this._adminRepository.blockUser(user_id);
    if (result) {
      return {
        status: 200,
        data: {
          status: true,
          message: "blocked user successfull",
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "failed to block user, please try later",
        },
      };
    }
  }

  // unblock user
  async userUnblock(user_id: string) {
    const result = await this._adminRepository.unblockUser(user_id);
    if (result) {
      return {
        status: 200,
        data: {
          status: true,
          message: "unblocked user successfull",
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "failed to unblock user, please try later",
        },
      };
    }
  }

  // all tutors data
  async tutorsData(page: number, limit: number) {
    const { tutors, totalTutors } = await this._adminRepository.findTutors(
      page,
      limit
    );
    if (tutors !== null) {
      return {
        status: 200,
        data: {
          tutors,
          totalTutors,
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "Something went wrong, unable to fetch tutors",
        },
      };
    }
  }

  // block user
  async tutorBlock(tutor_id: string) {
    const result = await this._adminRepository.blockTutor(tutor_id);
    if (result) {
      return {
        status: 200,
        data: {
          status: true,
          message: "blocked tutor successfull",
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "failed to block tutor, please try later",
        },
      };
    }
  }

  // unblock user
  async tutorUnblock(tutor_id: string) {
    const result = await this._adminRepository.unblockTutor(tutor_id);
    if (result) {
      return {
        status: 200,
        data: {
          status: true,
          message: "unblocked tutor successfull",
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "failed to unblock tutor, please try later",
        },
      };
    }
  }
  // category usecase start here
  async saveCategory(category: ICategory) {
    const saveData = await this._adminRepository.createCategory(category);
    console.log(saveData, "cate data save");

    if (saveData.success === true) {
      return {
        status: 201,
        data: {
          message: saveData.reason || "New Category Created",
        },
      };
    } else {
      return {
        status: 400,
        message: saveData.reason || "Failed to create category",
      };
    }
  }

  async categoryData(page: number, limit: number) {
    const { categories, totalCategory } =
      await this._adminRepository.findCategory(page, limit);
    if (categories !== null) {
      return {
        status: 200,
        data: {
          categories,
          totalCategory,
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "Something went wrong, unable to fetch category",
        },
      };
    }
  }

  // unlist user
  async categoryUnlist(category_id: string) {
    const result = await this._adminRepository.unlistCategory(category_id);
    if (result) {
      return {
        status: 200,
        data: {
          status: true,
          message: "Category Unlisted Successfully",
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "failed to unlist category, please try later",
        },
      };
    }
  }
  // list user
  async categoryList(category_id: string) {
    const result = await this._adminRepository.listCategory(category_id);
    if (result) {
      return {
        status: 200,
        data: {
          status: true,
          message: "Category Listed Successfully",
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "failed to list category, please try later",
        },
      };
    }
  }
  // edit category
  async categoryUpdate(newCategory: string, category_id: string) {
    const result = await this._adminRepository.UpdateCategory(
      newCategory,
      category_id
    );
    if (result.success) {
      return {
        status: 200,
        message: result.reason || "Category updated successfully",
      };
    } else {
      return {
        status: 400,
        message: result.reason || "Failed to update category, please try again",
      };
    }
  }

  // get all courses
  async allCourseGet(limit: number, skip: number) {
    const Courses = await this._adminRepository.getCourses(limit, skip);
    const getCourses = await this.s3GetFunction(Courses);
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
  async countCourses() {
    const itemsCount = await this._adminRepository.coursesCount();
    return itemsCount;
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
  async getViewCourse(course_id: string) {
    const getCourses = await this._adminRepository.getCourseView(course_id);
    console.log(getCourses, "getViewCourses");
    const getViewCourses = await this.s3GenerateForViewCourse(getCourses);
    console.log(getViewCourses, "aray s3 bucke");

    if (getViewCourses) {
      return {
        status: 200,
        data: {
          getViewCourses,
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

  // unapprovedCourses
  async unapprovedCourses() {
    const fetchUnapprovedCourse =
      await this._adminRepository.findUnapprovedCourse();
    const { getCourses, totalUnverify } = await this.s3GenerateForViewCourse(
      fetchUnapprovedCourse
    );
    console.log(getCourses, "aray s3 bucke");

    if (getCourses) {
      return {
        status: 200,
        data: {
          getCourses,
          totalUnverify,
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

  // courseVerify
  async courseVerify(courseid: string) {
    const result = await this._adminRepository.verifyCourse(courseid);
    if (result) {
      return {
        status: 200,
        data: {
          status: true,
          message: "Course verified Successfully",
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "failed to verify course, please try later",
        },
      };
    }
  }
  // unverifyCourse
  async courseUnverify(courseid: string) {
    const result = await this._adminRepository.unverifyCourse(courseid);
    if (result) {
      return {
        status: 200,
        data: {
          status: true,
          message: "Course unverified Successfully",
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "failed to unverify course, please try later",
        },
      };
    }
  }

  // reviewsFetch
  async reviewsFetch(courseId: string) {
    const getReviews = await this._adminRepository.getReview(courseId);
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
    const assignmentsFetch = await this._adminRepository.fetchAssignments(
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
    console.log("coming admint usecase");

    const getInstructor = await this._adminRepository.fetchInstructor(
      instructorId
    );
    return {
      status: 200,
      data: getInstructor,
    };
  }

  // fetchReports
  async fetchReports() {
    const getReports = await this._adminRepository.reportsFetch();
  
    if (getReports === null) {
      return {
        status: 200,
        data: {
          data: "",
          message: "No reports are yet",
        },
      };
    }
  
    const reportedCourses = await Promise.all(
      getReports.map(async (course) => {
        // Fetch course details
        const findCourse = await this._adminRepository.findCourseById(
          course.courseId
        );
        if (!findCourse) {
          console.error(`Course with ID ${course.courseId} not found.`);
          return null;
        }
  
        // Fetch instructor details
        const findInstructor = await this._adminRepository.findInstructorById(
          findCourse.instructorId
        );
        if (!findInstructor) {
          console.error(
            `Instructor with ID ${findCourse.instructorId} not found.`
          );
          return null;
        }
  
        const S3ThumbnailImg = await this._S3Uploader.getSignedUrl(
          findCourse.thamnail
        );
  
        return {
          courseId: findCourse.courseId,
          courseName: findCourse.courseName,
          thumbnail: S3ThumbnailImg,
          reportedCount: course.reportedCount,
          instructor: {
            instructorName: findInstructor.instructorName,
            email: findInstructor.email,
          },
        };
      })
    );
  
    const validReports = reportedCourses.filter((report) => report !== null);
  
    return {
      status: 200,
      data: {
        data: validReports,
        message: "Successfully fetched reports",
      },
    };
  }
  
  // deleteCourse
  async deleteCourse(courseId:string,courseName:string,email:string,instructorName :string){
    const sendMail = await this._generateMail.sendCourseDeleteMail(email,instructorName,courseName)
    const result = await this._adminRepository.courseDelete(courseId)
    const deleteReport = await this._adminRepository.deleteReport(courseId)
    if (result && deleteReport) {
      return {
        status:200,
        message:"This course deleted Successfully"
      }
    } else {
      return{
      status:400,
      message:"Something went wrong the course and report deletion"}
    }
  }

    // getRates
    async getRates(){
      const getRate = await this._adminRepository.ratesGet();
      return {
        status:200,
        getRate
      }
      
    }
}
export default AdminUseCase;
