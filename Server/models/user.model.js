import mongoose from "mongoose"
import { ref } from "yup"

const userShema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Tralaleo tralala or Tung tung tung tung tung sahur"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "provide password"]
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar:{
        type: String,
        default: ''
    }, 
    mobile: {
        type: Number,
        default: null,
        required: [true, "gimme your mobile mommy"]
    },
    refresh_token: {
        type: String,
        default: ''
    }, 
    verify_email: {
        type:Boolean,
        default:false
    },
    last_login_date:{
        type:Date,
        default:''
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Suspended"]
    },
    address_details: [
        {
            type: mongoose.Schema.ObjectId,
            ref: order
        }
    ],
    shopping_cart: [{
        type: mongoose.Schema.ObjectId,
        ref: 'cartProduct'
    }],
    orderHistory: [{
        type: mongoose.Schema.ObjectId,
        ref: 'order'
    }],
    forgot_password_expiry: {
        type:Date,
        default:''
    },
    role:{
        type:String,
        enum: ["ADMIN", "USER"],
        default: "USER"
    }
}, {
    timestamps:true
})

const UserMOdel = mongoose.model("User", userShema)
export default UserMOdel