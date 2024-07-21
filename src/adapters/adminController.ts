import { json } from "stream/consumers";
import { Req, Res, Next } from "../infrastructure/type/expressTypes";
import AdminUseCase from "../useCase/adminUseCase";

class AdminController {
  private adminUseCase: AdminUseCase;
  constructor(adminUseCase: AdminUseCase) {
    this.adminUseCase = adminUseCase;
  }

  // taking all users for listing them
  async getUsers(req: Req, res: Res, next: Next) {
    try {
      const userList = await this.adminUseCase.usersData();
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
        const tutorsList = await this.adminUseCase.tutorsData();
        console.log(tutorsList,"tutotr data");
        
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
}
export default AdminController;
