interface Lecture{
    _id?:string;
    title:string;
    description:string;
    video_url:string;
    pdf_url:string;
    createdAt?: Date; 
}

export default Lecture;