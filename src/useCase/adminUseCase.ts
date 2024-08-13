import { stat } from "fs";
import ICategory from "../domain/Icategory";
import Tutor from "../domain/tutor";
import User from "../domain/user";
import AdminRepository from "../infrastructure/repository/adminRepository";
import GenerateMail from "../infrastructure/services/sendMailer";
import S3Uploader from "../infrastructure/services/s3BucketAWS";

class AdminUseCase {
  private GenerateMail: GenerateMail;
  private AdminRepository: AdminRepository;
 private S3Uploader: S3Uploader;
  constructor(
    adminRepository: AdminRepository, 
    generateMail: GenerateMail,
    s3Uploader: S3Uploader,
  ) {
    this.AdminRepository = adminRepository;
    this.GenerateMail = generateMail;
    this.S3Uploader = s3Uploader;
  }

  async usersData(page: number, limit: number) {
    const { users, totalUsers } = await this.AdminRepository.findUsers(
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
    const result = await this.AdminRepository.blockUser(user_id);
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
    const result = await this.AdminRepository.unblockUser(user_id);
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
    const { tutors, totalTutors } = await this.AdminRepository.findTutors(
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
    const result = await this.AdminRepository.blockTutor(tutor_id);
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
    const result = await this.AdminRepository.unblockTutor(tutor_id);
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
    const saveData = await this.AdminRepository.createCategory(category);
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
        message: saveData.reason || "Failed to create category"
      };
    }
  }

  async categoryData(page: number, limit: number) {
    const { categories, totalCategory } = await this.AdminRepository.findCategory(
      page,
      limit
    );
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
    const result = await this.AdminRepository.unlistCategory(category_id);
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
    const result = await this.AdminRepository.listCategory(category_id);
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
  async categoryUpdate(newCategory:string,category_id:string){
    const result = await this.AdminRepository.UpdateCategory(newCategory,category_id)
    if (result.success) {
      return {
        status:200,
        message:  result.reason || "Category updated successfully" 
      }
    } else {
      return {
        status:400,
        message:result.reason || "Failed to update category, please try again"
      }
    }
  }

  // get all courses
  async allCourseGet (){
    const Courses = await this.AdminRepository.getCourses();
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

  // url thorugh data fetching from s3
  async s3GetFunction(getCourses: any) {
    console.log("kkkk");
    const coursesWithSignedUrls = await Promise.all(
      getCourses.map(async (course: any) => {
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

  //individual getViewCourse
  async getViewCourse (course_id:string){
    const getCourses =
      await this.AdminRepository.getCourseView(course_id);
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
export default AdminUseCase;
