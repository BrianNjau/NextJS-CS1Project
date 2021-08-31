import express from 'express';
import formidable from 'express-formidable'
const router = express.Router();

//middleware 
import {isCreator, requireSignin} from '../middlewares'

//controllers
import {
uploadImage,removeImage, create, read,uploadVideo, removeVideo,addEpisode,update, removeMedia,updateEpisode, publishContent, unpublishContent, contents, checkEnrollment,freeEnrollment
} from '../controllers/content'

router.get('/contents', contents)

//image
router.post('/content/upload-image', uploadImage);
router.post('/content/remove-image', removeImage);
//content
router.get('/content/:slug', read);
router.post('/content', requireSignin, isCreator, create);
router.put('/content/:slug', requireSignin, update);
router.post('/content/video-upload/:creatorId', requireSignin, formidable(),uploadVideo);
router.post('/content/video-remove/:creatorId', requireSignin,removeVideo);

//publish unpublish
router.put('/content/publish/:contentId', requireSignin, publishContent);
router.put('/content/unpublish/:contentId', requireSignin, unpublishContent);


router.post('/content/episode/:slug/:creatorId', requireSignin, addEpisode);
router.put('/content/episode/:slug/:creatorId', requireSignin, updateEpisode);
router.put('/content/:slug/:mediaId', requireSignin, removeMedia);

router.get('/check-enrollment/:contentId', requireSignin , checkEnrollment)

//enrollment

router.post("/free-enrollment/:contentId", requireSignin, freeEnrollment);


  module.exports = router; 