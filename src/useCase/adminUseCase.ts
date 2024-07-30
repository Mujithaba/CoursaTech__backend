import Tutor from "../domain/tutor";
import User from "../domain/user";
import AdminRepository from "../infrastructure/repository/adminRepository";
import GenerateMail from "../infrastructure/services/sendMailer";

class AdminUseCase {
  private GenerateMail: GenerateMail;
  private AdminRepository: AdminRepository;
  constructor(adminRepository: AdminRepository, generateMail: GenerateMail) {
    this.AdminRepository = adminRepository;
    this.GenerateMail = generateMail;
  }

  async usersData(page: number, limit: number) {
    const { users, totalUsers } = await this.AdminRepository.findUsers(page, limit);
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
async userUnblock(user_id:string){
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
async tutorsData (page: number, limit: number) {
  const { tutors, totalTutors } = await this.AdminRepository.findTutors(page, limit);
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
async tutorUnblock(tutor_id:string){
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

}
export default AdminUseCase;
