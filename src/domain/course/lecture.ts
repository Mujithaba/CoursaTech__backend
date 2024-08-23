interface Lecture{
    _id?:string | undefined;
    course_id?:string;
    title:string;
    description:string;
    video:string;
    pdf:string;
    createdAt?: Date; 
}

export default Lecture;