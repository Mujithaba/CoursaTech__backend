interface Assignment {
    _id?: string; 
    course_id:string;
    title: string; 
    pdf_file: string; 
    createdAt?: Date; 
}

export default Assignment;