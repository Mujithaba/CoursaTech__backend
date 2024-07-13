import  jwt  from "jsonwebtoken";
import JWT from "../../useCase/Interface/jwt";

class JwtToken implements JWT {
    generateToken(userId?: string, role?: string): string {

        const SECRETKEY =process.env.SECRET_KEY
        console.log(SECRETKEY,"secrete key jwt");
        

        if (SECRETKEY) {
            const token = jwt.sign({userId,role},SECRETKEY,{
                expiresIn:'30d'
            })
            return token
        }
        throw new Error('jwt key is not defined')
    }
}

export default JwtToken