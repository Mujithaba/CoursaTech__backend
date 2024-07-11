import { Req,Res,Next } from "../type/expressTypes"

let errorHandle = async(error:Error,req:Req,res:Res,next:Next)=>{

    return res.status(400).json({message:error})


}

export default errorHandle