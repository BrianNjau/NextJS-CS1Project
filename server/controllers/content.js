import  AWS from 'aws-sdk'
import {nanoid} from 'nanoid'
import PlaylistContent from '../models/content'
import slugify from 'slugify'
import {readFileSync} from "fs"
import User from "../models/user";
import { exec } from 'child_process'

const awsConfig = {
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    region:process.env.AWS_REGION,
    apiVersion:process.env.AWS_API_VERSION,

}


const S3 =new AWS.S3(awsConfig)

export const uploadImage = async(req,res)=>{
    // console.log(req.body);
try{
const {image} = req.body
if(!image) return res.status(400).send("No image");

//prepare image
const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");

const type = image.split(';')[0].split('/')[1];

//image params
const params = {
    Bucket: "zerity-bucket",
    Key: `${nanoid()}.${type}}`,
    Body: base64Data,
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: `image/${type}`,
};

// upload to s3 
S3.upload(params, (err,data)=>{
    if(err){
        console.log(err)
        return res.sendStatus(400);
    }
    console.log(data);
    res.send(data);
});

}catch(err){
    console.log(err)
}

}

export const removeImage = async (req,res) =>{
    try{
const {image} = req.body;
const params = {
    Bucket: image.Bucket,
    Key: image.Key,
};

//send remove request to s3 
S3.deleteObject(params, (err,data)=>{
    if(err){
        console.log(err);
        res.sendStatus(400);

    }
    res.send({ok:true});
});
    }catch(err){
        console.log(err)
    }
}

export const create = async (req,res) => {
    // console.log("CREATE CONTENT", req.body);
    // return;
   try{

    const alreadyExist = await PlaylistContent.findOne({
        slug: slugify(req.body.name.toLowerCase()),

    });
    if(alreadyExist) return res.status(400).send("Title is taken");

const playlistcontent = await new PlaylistContent({
    slug: slugify(req.body.name),
    creator: req.user._id,
    ...req.body,
}).save();
res.json(playlistcontent);
   } catch(err){
    console.log(err)
    return res.status(400).send('Content create failed. Try again. ')
   }
}

export const read = async (req,res) =>{
    try{
        const content = await PlaylistContent.findOne({slug: req.params.slug})
        .populate('creator','_id name')
        .exec();
        res.json(content);
    }catch(err){

    }
}

export const uploadVideo = async (req,res) =>{
    try{
        // console.log('req.user._id', req.user._id)
        // console.log('req.params.creatorId',req.params.creatorId)
            if(req.user._id != req.params.creatorId){
                return res.status(400).send("Unauthorized")
            }
        const {video} = req.files;

        // console.log(video);
        if(!video)return res.status(400).send("No video");
        //video params
        const params ={
            Bucket: "zerity-bucket",
            Key: `${nanoid()}.${video.type.split('/')[1]}}`, //video/mp4
            Body: readFileSync(video.path),
            ACL: 'public-read',
            ContentType:video.type,




        };
        //upload to s3 
        S3.upload(params, (err,data)=>{
            if(err){
                console.log(err)
                res.sendStatus(400);
            }
            console.log(data);
            res.send(data);
        })

    }catch(err){
        console.log(err)

    }
}


export const removeVideo = async (req,res) =>{
    try{

        if(req.user._id != req.params.creatorId){
            return res.status(400).send("Unauthorized")
        }

        const {Bucket, Key} = req.body;

        // console.log(video);
        // return;
       
        //video params
        const params ={
            Bucket,
            Key, //video/mp4
         




        };
        //upload to s3 
        S3.deleteObject(params, (err,data)=>{
            if(err){
                console.log(err)
                res.sendStatus(400);
            }
            console.log(data);
            res.send({ok:true});
        })

    }catch(err){
        console.log(err)

    }
}

export const addEpisode = async (req,res)=>{
    try{
        const {slug, creatorId} = req.params;
        const {title, content, video} = req.body;
        if(req.user._id != creatorId){
            return res.status(400).send("Unauthorized")
        } 
        const updated = await PlaylistContent.findOneAndUpdate({slug}, {
            $push:{media:{title, content,video, slug:slugify(title)}}
        },{
            new:true
        }).populate("creator", "_id name").exec();
res.json(updated);
    }catch(err){
        console.log(err)
        return res.status(400).send("Add episode failed");
    }
}

export const update = async (req,res) =>{
    try{
        const {slug} = req.params;
        // console.log(slug)
      const content = await PlaylistContent.findOne({slug}).exec();
      console.log("CONTENT FOUND =>", content )
    if(req.user._id != content.creator){
        return res.status(400).send("Unauthorized");
    }
    const updated = await PlaylistContent.findOneAndUpdate({slug}, req.body, {
        new:true,
    }).exec();
    res.json(updated);

    }catch(err){
        console.log(err);
        return res.status(400).send(err.message);
    }
   

}

export const removeMedia = async (req,res) =>{
    const {slug, mediaId} = req.params;
    const content = await PlaylistContent.findOne({slug}).exec();
    if(req.user._id != content.creator){
        return res.status(400).send("Unauthorized");
    } 
    const deletedMedia = await PlaylistContent.findByIdAndUpdate(content._id,{
        $pull: { media: {_id: mediaId}}, 

    }).exec();
    res.json({ok:true}); 
};

export const updateEpisode= async (req,res) =>{
    // console.log('UPDATE LESSON =>', req.body);
   try{
    const {slug} = req.params;
    const {_id,title, content, video, free_preview} = req.body;
    const episode = await PlaylistContent.findOne({slug}).select("creator").exec();
    
    if(episode.creator._id != req.user._id){
        return res.status(400).send("Unauthorized");
    }

    const updated = await PlaylistContent.updateOne({"media._id": _id}, {
        $set:{
            "media.$.title": title,
            "media.$.content": content,
            "media.$.video": video,
            "media.$.free_preview": free_preview,

        },
    },{new:true}
    ).exec();
    // console.log("updated", updated); 
    res.json({ok:true});

   }catch(err){
    console.log(err)
    return res.status(400).send('Update episode Failed')
   }

}

export const publishContent = async(req,res) =>{
    try{
        const {contentId} = req.params
        const content = await PlaylistContent.findById(contentId).select("creator").exec();
         if(content.creator._id != req.user._id){
        return res.status(400).send("Unauthorized");
    }

    const updated = await PlaylistContent.findByIdAndUpdate(contentId, {published: true}, 
        {new: true}
        ).exec();

        res.json(updated);
        
    }catch(err){
        console.log(err)
        return res.status(400).send("Publish content failed");
    }
}








export const unpublishContent = async(req,res) =>{
    try{
        const {contentId} = req.params
        const content = await PlaylistContent.findById(contentId).select("creator").exec();
         if(content.creator._id != req.user._id){
        return res.status(400).send("Unauthorized");    
    }
    const updated = await PlaylistContent.findByIdAndUpdate(contentId, {published: false}, 
        {new: true}
        ).exec();

        res.json(updated);


}catch(err){
        console.log(err)
        return res.status(400).send("Unpublish content failed");

    }
}


export const contents = async (req,res) => {
    const all = await PlaylistContent.find({published: true})
    .populate('creator', '_id name')
    .exec();
    res.json(all); 
} 

export const checkEnrollment = async (req,res) => {
    const {contentId} = req.params;

    const user = await User.findById(req.user._id).exec();
let ids=[]
let length = user.content && user.content.length;
for (let i=0; i<length; i++){
    ids.push(user.content[i].toString())

}
res.json({
    status: ids.includes(contentId),
    content: await PlaylistContent.findById(contentId).exec(),
})

}

export const freeEnrollment = async (req,res)=>{
try{
    //check
    const content = await PlaylistContent.findById(req.params.contentId).exec()
    if(content.paid)return;
    const result = await User.findByIdAndUpdate(
        req.user._id,{
        $addToSet : {content :content._id},
    },
    {new:true}
    ).exec();
   
    res.json({ 
        message: "Congratulations, you have successfully enrolled",
        content,
    })
    console.log()
}catch(err){
console.log('Free enrolment err', err);
return res.status(400).send('Create enrollment failed')
}

}