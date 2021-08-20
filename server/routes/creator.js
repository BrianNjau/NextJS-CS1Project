import express from 'express';

const router = express.Router();

//middleware 
import {requireSignin} from '../middlewares'

//controllers
import {makeCreator, getAccountStatus} from '../controllers/creator'

router.post("/make-creator", requireSignin,makeCreator)
router.post("/get-account-status", requireSignin, getAccountStatus)

  module.exports = router; 