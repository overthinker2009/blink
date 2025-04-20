import jwt from "jsonwebtoken"
import { errors } from "undici-types"

const authMiddlewere = async (req, res, next) => {
    try{
        const token = req.cookies.accessToken || req?.header?.authourization?.split(" ")[1]
        if (!token){
            return res.status(401).json({
                message:"you are not logged in",
                error:true,
                success:false
            })
        }

        const decoded = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)

        if(!decoded){
            return res.status(401).json({
                message:"unauthorized access!!!!",
                error:true,
                success:false
            })
        }

        req.userId = decoded.userId
        next()
    } catch(error){ 
        return res.status(500).json({
            message: "internal server error ",
            error:true,
            success:false
        })

    }
}

export default authMiddlewere