import { errors } from "undici-types";
import { hashedPassword, comparePasswords, hashedPassword } from "../helper/passwordHashing";

import UserModel from "../models/user.model";
import generateAccessToken from "../utils/generateAccessToken";
import generateRefreshToken from "../utils/generateRefreshToken";
import verificationEmailTemplate from "../utils/verificationEmailTemplate";
import dotenv from 'dotenv'

import jwt from 'jsonwebtoken'


dotenv.config()
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

        const existingUser = await UserModel.findOne({$or: [{email}, {mobile}] })

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


export const verifyUserController = async (req, res) => {
    try{
        const { code } = req.body

        const user = await UserModel.findOneAndUpdate(
            {_id: code },
            {$set:{ verify_email:true}}

        )

        if(!user) {
            return res.status(400).json({
                message:"invalide code",
                error:true,
                succes:false
            })
        }

        return res.status(200).json({
            message: "email verified succesfully",
            error:false,
            succes:true
        })
    } catch(error) {
        return res.status(500).json({
            message:error.message || error,
            error:true,
            succes:false
        })
        
    }
}

export const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body
  
        if (!email || !password) {
        return res.status(400).json({
            message: 'Please fill all required fields',
            error: true,
            success: false
        })
    }

        const user = await UserModel.findOne({ email })
        if (!user) {
        return res.status(400).json({
            message: 'User not registered',
            error: true,
            success: false
        })
    } 

    if(user.status !== "Active"){
        return res.status(400).json({
            message: `${user.status} is banned or whatever`,
            error:true,
            succes:false
        })
    }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
        return res.status(401).json({
            message: 'Invalid email or password',
            error: true,
            success: false
        })
    }

      const accessToken = await generateAccessToken(user._id)
      const refreshToken = await generateRefreshToken(user._id)

        const cookiesOption = {
        httpOnly: true,
        secure: false, 
        sameSite: 'None'
        }

        res.cookie('accessToken', accessToken, cookiesOption)
        res.cookie('refreshToken', refreshToken, cookiesOption)
  
      return res.status(200).json({
        message: 'Login successful',
        error: false,
        success: true,
        data: {
          user,
          accessToken,
          refreshToken
        }
      })
  
    } catch (error) {
      console.error('Login error:', error)
      return res.status(500).json({
        message: 'Internal server error',
        error: true,
        success: false
      })
    }
  }

export const LogoutUserController = async (req, res) => {
    try{

        const userId = req.userId

        const cookiesOption = {
            httpOnly: true,
            secure: true, 
            sameSite: 'None'
            }

        res.clearCookie("accessToken", accessToken)
        res.clearCookie("refreshToken", refreshToken)

        const removeRefershToken = await UserModel.findByIdAndUpdate(userId,
            {
                refresh_roken: ""
            }
        )
    } catch (error){
        return res.status(500).json({
            message: error.message ||error,
            error:true,
            succes:true
        })
    }
}