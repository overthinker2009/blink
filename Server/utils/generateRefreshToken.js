import jwt from 'jsonwebtoken'
import UserMOdel from '../models/user.model'

const generateRefreshToken = async (userId) => {
    const token = await jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn:'7d' }
    )

    const updateRefreshToken = await UserMOdel.updateOne(
        { _id: userId },
        {refresh_token: token}
    )
    return token
}

export default generateRefreshToken