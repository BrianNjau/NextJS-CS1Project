import mongoose from 'mongoose'
const  {ObjectId} = mongoose.Schema;

const contentSchema = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        minlength:3,
        maxlegnth:320,
        required:true,
    },
    slug:{
        type:String,
        lowercase:true,
    },
    content:{
        type:{},
        minlength:200,
    },
    video:{},
    free_preview:{
        type: Boolean,
        default:false,
    },
},
{ timestamps:true }
);
//like course-schema
const playlistContentSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        minlength:3,
        maxlegnth:320,
        required:true,
    },
    slug:{
        type:String,
        lowercase:true,
    },
    description:{
        type:{},
        minlength:200,
        required:true, 
    },
    price:{
        type: Number,
        default: 9.99,
    },
    image:{},
    category:String,
    published:{
        type: Boolean,
        default:false,
    },
    paid:{
        type: Boolean,
        default:true,

    },
    
    creator:{
        type: ObjectId,
        ref:"User",
        required:true,

    },
    media:[contentSchema],

},{timestamps:true});

export default mongoose.model('PlaylistContent', playlistContentSchema);
