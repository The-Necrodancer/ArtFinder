import { Router } from "express";
import cloudinary from 'cloudinary';
const router = Router();

const myconfig = cloudinary.config({
  cloud_name: 'dbozj84g9',
  api_key: '228588796346678',
  api_secret: '6KSMb3BaC3UmHIvG58u5vxMNUWA',
  secure: true
});


router.get('/signuploadwidget', (req, res) => {
    const timestamp = Math.round((new Date).getTime()/1000);
    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        source: 'uw',
        folder: 'signed_upload_demo_uw'}, myconfig.api_secret);
    console.log(signature); 
    res.json({timestamp, signature}); 
});

export default router; 