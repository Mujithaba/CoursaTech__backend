import User from "../../domain/user";
import Tutor from "../../domain/tutor";

interface AdminRep {
  // users taking 
  findUsers(
    page: number,
    limit: number
  ): Promise<{ users: User[]; totalUsers: number }>;
  blockUser(userID: string): Promise<boolean>;
  unblockUser(userID: string): Promise<boolean>;
  // tutors taking
  findTutors(
    page: number,
    limit: number
  ): Promise<{ tutors: Tutor[]; totalTutors: number }>;
  blockTutor(tutorID: string): Promise<boolean>;
  unblockTutor(userID: string): Promise<boolean>;
}

export default AdminRep;
