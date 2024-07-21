import User from "../../domain/user";
import Tutor from "../../domain/tutor";

interface AdminRep {
  findUsers(): Promise<User[] | null>;
  blockUser(userID: string): Promise<boolean>;
  unblockUser(userID:string):Promise<boolean>
  findTutors():Promise<Tutor[] | null>;
  blockTutor(tutorID :string):Promise<boolean>;
  unblockTutor(userID:string):Promise<boolean>;
}

export default AdminRep;
