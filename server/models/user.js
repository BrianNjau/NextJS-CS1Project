import mongoose from 'mongoose'
const {Schema} = mongoose
const {ObjectId} = Schema
const userSchema = new Schema({
    name:{
        type: String,
        trim:true, 
        required: true,
    },
    email:{
        type: String,
        trim:true, 
        required: true,
        unique:true,
    },
    password:{
        type: String,
        trim:true, 
        required: true,
        min:6,
        max:64,
    },
    picture:{
        type: String,
        default:"/avatar.png",
    },
    role:{
        type: [String],
        default: ["Subscriber"],
        enum: ["Subscriber", "Creator", "Admin"]
    },
    emailverified:{
        type: Boolean,
        default: false,

    },
    stripe_account_id:'',
    stripe_seller:{},
    stripeSession:{},
    passwordResetCode: {
        data: String,
        default:"",

    }, 
    content: [{type: ObjectId, ref:"Content"}],
}, 

{timestamps:true }
);

export default mongoose.model('User',userSchema);