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
      console.log("unblk",userID);
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
      console.log("unblk",tutorID);
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
  async saveCategory (req:Req,res:Res,next:Next){
    try {
      console.log("cate contrller");
      
      const {category} = req.body
      console.log("category",category);

      const Category:ICategory ={categoryName:category}
     
      const saveCategory = await this.adminUseCase.saveCategory(Category)
      if (saveCategory.status == 201) {
        return res.status(saveCategory.status).json(saveCategory.data)
      } else {
        return res.status(saveCategory.status).json({ message: saveCategory.message })
      }
      
    } catch (error) {
      next(error)
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
  async categoryEdit (req:Req,res:Res,next:Next){
    try {
      console.log("edit controller");
      
      const {newCategory,categoryID}= req.body
      console.log(newCategory,categoryID,"kkkkk");
      
      const result = await this.adminUseCase.categoryUpdate(newCategory,categoryID)
      if (result.status == 200) {
        return res.status(result.status).json({message:result.message})
      } else {
        
        return res.status(result.status).json({message:result.message})
      }
    } catch (error) {
      next(error)
    }
  }
}
export default AdminController;
