import Lecture from "./lecture";

interface Modules {
    _id?:string;
    course_id:string;
    name?:string;
    lectures?:Lecture[];
    createdAt?: Date;
}

export default Modules;