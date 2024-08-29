import { json } from "stream/consumers";
import { Req, Res, Next, Obj } from "../infrastructure/type/expressTypes";
import AdminUseCase from "../useCase/adminUseCase";
import ICategory from "../domain/Icategory";

class AdminController {
  private adminUseCase: AdminUseCase;
  constructor(adminUseCase: AdminUseCase) {
    this.adminUseCase = adminUseCase;
  }

  // taking all users for listing them
  async getUsers(req: Req, res: Res, next: Next) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 3;

      const userList = await this.adminUseCase.usersData(page, limit);
      return res.status(userList.status).json(userList.data);
    } catch (error) {
      next(error);
    }
  }

  // user block
  async blockUser(req: Req, res: Res, next: Next) {
    try {
      const { userID } = req.body;
      console.log("blk conntroller", userID);
      const result = await this.adminUseCase.userBlock(userID);

      if (result.status == 200) {
        return res.status(result.status).json(result.data.message);
      } else {
        return res.status(result.status).json(result.data.message);
      }
    } catch (error) {
      next(error);
    }
  }
  // unblock user
  async unblockUser(req: Req, res: Res, next: Next) {
    try {
      const { userID } = req.body;
      console.log("unblk", userID);
      const result = await this.adminUseCase.userUnblock(userID);
      if (result.status == 200) {
        return res.status(result.status).json(result.data.message);
      } else {
        return res.status(result.status).json(result.data.message);
      }
    } catch (error) {
      next(error);
    }
  }

  // taking all tutors for listing them
  async getTutors(req: Req, res: Res, next: Next) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 3;

      const tutorsList = await this.adminUseCase.tutorsData(page, limit);
      return res.status(tutorsList.status).json(tutorsList.data);
    } catch (error) {
      next(error);
    }
  }

  // tutor block
  async blockTutor(req: Req, res: Res, next: Next) {
    try {
      const { tutorID } = req.body;
      console.log("blk conntroller", tutorID);
      const result = await this.adminUseCase.tutorBlock(tutorID);

      if (result.status == 200) {
        return res.status(result.status).json(result.data.message);
      } else {
        return res.status(result.status).json(result.data.message);
      }
    } catch (error) {
      next(error);
    }
  }
  // unblock tutor
  async unblockTutor(req: Req, res: Res, next: Next) {
    try {
      const { tutorID } = req.body;
      console.log("unblk", tutorID);
      const result = await this.adminUseCase.tutorUnblock(tutorID);
      if (result.status == 200) {
        return res.status(result.status).json(result.data.message);
      } else {
        return res.status(result.status).json(result.data.message);
      }
    } catch (error) {
      next(error);
    }
  }

  // save category
  async saveCategory(req: Req, res: Res, next: Next) {
    try {
      console.log("cate contrller");

      const { category } = req.body;
      console.log("category", category);

      const Category: ICategory = { categoryName: category };

      const saveCategory = await this.adminUseCase.saveCategory(Category);
      if (saveCategory.status == 201) {
        return res.status(saveCategory.status).json(saveCategory.data);
      } else {
        return res
          .status(saveCategory.status)
          .json({ message: saveCategory.message });
      }
    } catch (error) {
      next(error);
    }
  }

  // taking all users for listing them
  async getCategories(req: Req, res: Res, next: Next) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 3;

      const cateList = await this.adminUseCase.categoryData(page, limit);
      return res.status(cateList.status).json(cateList.data);
    } catch (error) {
      next(error);
    }
  }

  //category unlist
  async categoryUnlist(req: Req, res: Res, next: Next) {
    try {
      const { categoryID } = req.body;
      console.log("blk conntroller", categoryID);
      const result = await this.adminUseCase.categoryUnlist(categoryID);

      if (result.status == 200) {
        return res.status(result.status).json(result.data.message);
      } else {
        return res.status(result.status).json(result.data.message);
      }
    } catch (error) {
      next(error);
    }
  }
  //category list
  async categoryList(req: Req, res: Res, next: Next) {
    try {
      const { categoryID } = req.body;
      console.log("blk conntroller", categoryID);
      const result = await this.adminUseCase.categoryList(categoryID);

      if (result.status == 200) {
        return res.status(result.status).json(result.data.message);
      } else {
        return res.status(result.status).json(result.data.message);
      }
    } catch (error) {
      next(error);
    }
  }
  // category update
  async categoryEdit(req: Req, res: Res, next: Next) {
    try {
      console.log("edit controller");

      const { newCategory, categoryID } = req.body;
      console.log(newCategory, categoryID, "kkkkk");

      const result = await this.adminUseCase.categoryUpdate(
        newCategory,
        categoryID
      );
      if (result.status == 200) {
        return res.status(result.status).json({ message: result.message });
      } else {
        return res.status(result.status).json({ message: result.message });
      }
    } catch (error) {
      next(error);
    }
  }

  async getCourse(req: Req, res: Res, next: Next) {
    try {
      console.log("course admin conroller getting");
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const getAllCourses = await this.adminUseCase.allCourseGet(Number(limit), skip);
      if (getAllCourses) {
        const totalItems = await this.adminUseCase.countCourses();
        console.log(totalItems,"total");
        
        return res.status(getAllCourses.status).json({ ...getAllCourses.data, totalItems });
      } else {
        return res.status(404).json({ message: "No courses found" });
      }
    } catch (error) {
      next(error);
    }
  }
  // get view course
  async ViewCourses(req:Req,res:Res,next:Next){
    try {
      
      const id = req.query.id as string
      
      const courseViewData = await this.adminUseCase.getViewCourse(id);

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
  // getUnapprovedCourse
  async unapprovedCourse (req:Req,res:Res,next:Next){
    try {
      console.log("getViewCourse controller");
      const getUnapprCourse = await this.adminUseCase.unapprovedCourses()
      console.log(getUnapprCourse,"get course unapprove");
      
      if (getUnapprCourse) {
        return res
          .status(getUnapprCourse.status)
          .json(getUnapprCourse.data);
      } else {
        return res.status(404).json({ message: "No course found" });
      }
      
    } catch (error) {
      next(error)
    }
  }
  async courseApproved(req: Req, res: Res, next: Next) {
    try {
      const { course_id } = req.body;
      console.log("verify conntroller", course_id);
      const result = await this.adminUseCase.courseVerify(course_id);

      if (result.status == 200) {
        return res.status(result.status).json(result.data.message);
      } else {
        return res.status(result.status).json(result.data.message);
      }
    } catch (error) {
      next(error);
    }
  }
  async courseUnapproved(req: Req, res: Res, next: Next) {
    try {
      const { course_id } = req.body;
      console.log("verify conntroller", course_id);
      const result = await this.adminUseCase.courseUnverify(course_id);

      if (result.status == 200) {
        return res.status(result.status).json(result.data.message);
      } else {
        return res.status(result.status).json(result.data.message);
      }
    } catch (error) {
      next(error);
    }
  }
  // reviewsFetch
  async getReviews(req:Req,res:Res,next:Next){
    try {
      const courseId = req.query.courseId as string;
      console.log(courseId,"hhh");
      const getReview = await this.adminUseCase.reviewsFetch(courseId)
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
      const assignmentsData= await this.adminUseCase.getAssignments(courseId)
      return res.status(assignmentsData.status).json(assignmentsData.data)
      
    } catch (error) {
      next(error)
    }
  }
  // getInstructor
  async getInstructor (req:Req,res:Res,next:Next){
    try {
      const instructorId=  req.query.instructorId  as string
      console.log("coming cotrl");
      
      const instructorData = await this.adminUseCase.getInstructorDetails(instructorId)
      return res.status(instructorData.status).json(instructorData.data)
    } catch (error) {
      next(error)
    }
  }
}
export default AdminController;
