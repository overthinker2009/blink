import { hashedPassword, comparePasswords, hashedPassword } from "../helper/passwordHashing";

import UserMOdel from "../models/user.model";
import generateAccessToken from "../utils/generateAccessToken";
import generateRefreshToken from "../utils/generateRefreshToken";
import verificationEmailTemplate from "../utils/verificationEmailTemplate";
import dotenv from 'dotenv'

import jwt from 'jsonwebtoken'


dotenv.config()

// register user
export const registerUserController = async (req, res) => {
    try {
        const {name, email, password, mobile } = req.body

        if(!name || !email || !password || !mobile){
            return res.status(400).json({
                message:'please fill required fields ',
                error:true,
                success: false
            })
        }

        const existingUser = await UserMOdel.findOne({$or: [{email}, {mobile}] })

        if(existingUser){
            res.status(400).json({
                message: existingUser.email === email ? "email is already registered" : "mobile number is registered",
                error: true,
                success:false
            })
        }

        const hashedPassword = await hashedPassword(password)

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            mobile
        })

        const savedUser = await newUser.save()

        const verifyEmailURL = `${process.env.CLIENT_URL}/verify-email?code=${savedUser._id}`

        await sendMail({
            sendTo:email,
            subject: "verification Email from Blinkit",
            html: verificationEmailTemplate({
                name:savedUser.name,
                url:verifyEmailURL
            })
        })

        const accessToken = await generateAccessToken(savedUser._id)
        const refreshToken = await generateRefreshToken(savedUser._id)

        const cookiesOption  ={
            httpOnly: true,
            secure:false,
            sameSite: 'None'
        }

        res.cookie("accessToken", accessToken, cookiesOption)
        res.cookie("refreshToken", refreshToken, cookiesOption)

        return res.status(201).json({
            message:"user registered succesfully",
            error:false,
            success:true,
            data:{
                user:savedUser,
                accessToken,
                refreshToken
            }
        })

    } catch (error) {
        return res.status(500).json({
            message:"internal server error",
            error:true,
            succes: false
        })
    }
}