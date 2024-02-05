const express = require('express')
const router = express.Router()
const User=require("../models/User")
const { body, validationResult} = require('express-validator');
const currentData=require("../models/currentData")
const bcrypt=require('bcrypt');
const saltNumber=10;
var jwt = require('jsonwebtoken')
const jwtSecret = "HaHa"
const sendEmail = require("../sendEmail");
const { default: mongoose } = require('mongoose');
require('dotenv').config()

router.post("/creatuser",[
    body('email').isEmail(),
    body('name').isLength({ min: 5 }),
    body('password').isLength({ min: 5 })], async(req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({success:false,message:"Enter valid credentials"});
    const salt=await bcrypt.genSalt(saltNumber)
    let securedPassword=await bcrypt.hash(req.body.password,salt);
    let email=req.body.email
    let fool=await User.findOne({'email':email})
    //console.log("signUp user", email)
    if (fool!=null) return res.json({success:false,message:"email allready exist"});
    try{
        const data = {
            email: email,
            name: req.body.name
        }
        const authToken = jwt.sign(data, jwtSecret);
        User.create({
            name: req.body.name,
            email:req.body.email,
            password:securedPassword
        })
		const url = `${process.env.BASE_URL}users/verify/${authToken}`;
		await sendEmail(email, "Verify Email", url);
        res.json({success:false,message:"An Email sent to your account please verify",data:authToken});
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:"Something went wring try again later"});
    }
})

router.post("/loginuser",[
    body('email').isEmail(),
    body('password').isLength({ min: 5 })], async(req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ success:false,message: "Enter valid credentials" });
    let email=req.body.email;
    //console.log("login user", email)
    try{
        let userData=await User.findOne({'email':email});
        if(!userData)return res.json({ success:false,message: "Enter valid Emial" });
        const bcryptPassword=await bcrypt.compare(req.body.password,userData.password);
        if(!bcryptPassword) return res.json({ success:false,message: "Enter valid Password" });
        const data = {
            email: email,
            name: userData.name
        }
        const authToken = jwt.sign(data, jwtSecret);
        if (!userData.verified) {
            const url = `${process.env.BASE_URL}users/verify/${authToken}`;
            await sendEmail(userData.email, "Verify Email", url);
			return res.json({success:false,message:"An Email sent to your account please verify",data:authToken});
		}
        return res.json({success:true,data:authToken})
    }

    catch(error){
        console.log(error)
        res.json({success:false,message:"Somthing went wrong try again later"});
    }
})

router.post("/verification", async(req,res)=> {
    let email=req.body.email;
    try {
		const user = await User.findOne({email:email});
		if (!user) return res.json({success:false,message:"Invalid Link"});
		await User.updateOne({ 'email':email}, {$set:{verified:true}});
        res.json({success:true,message:"Email verified successfully"});
	} catch (error) {
        console.log(error)
		res.json({ success:false,message: "Internal Server Error" });
	}
})

router.post("/update",async(req,res)=>{
    try {
        var check= await currentData.findOne({id:1});
        if(check!=null){
            await currentData.updateOne({ id:1}, {$set:{
                id:1,
                incoming:req.body.Incoming,
                drain:req.body.Drain,
                pump:req.body.Pump,
                togglePressure:req.body.togglePressure,
                drainPressure:req.body.drainPressure
            }});
        }
        else{
            currentData.create({
                id:1,
                incoming:req.body.Incoming,
                drain:req.body.Drain,
                pump:req.body.Pump,
                togglePressure:req.body.togglePressure,
                drainPressure:req.body.drainPressure
            })
        }
        return res.json({success:true})
    } catch (error) {
        return res.json({success:false,message:"somthing went wront try later"})
    }
})

router.post("/forgotPassword",[
    body('email').isEmail()], async(req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({success:false,message:"Enter valid credentials"});
    }
    let email=req.body.email
    let fool=await User.findOne({'email':email})
    //console.log("signUp user", email)
    if (fool==null) return res.json({success:false,message:"email not exist"});
    try{
        const data = {email: email}
        const authToken = jwt.sign(data, jwtSecret);
		const url = `${process.env.BASE_URL}users/reset/${authToken}`;
		await sendEmail(email, "resetPssword", url);
        res.json({success:true,message:"An Email sent to your account to resetPassword",data:authToken});
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:"Something went wrong try again later"});
    }
})

router.post("/updatePassword",[
    body('email').isEmail(),
    body('password').isLength({ min: 5 })], async(req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({success:false,message:"Enter valid credentials"});
    const salt=await bcrypt.genSalt(saltNumber)
    let securedPassword=await bcrypt.hash(req.body.password,salt);
    let email=req.body.email
    try{
        await User.updateOne({ 'email':email}, {$set:{password:securedPassword}});
        res.json({success:true,message:"password updated successfully"});
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:"Something went wring try again later"});
    }
})

router.post("/checkToken",async(req,res)=>{
    try {
        let authToken=req.body.authToken
        let decoded = jwt.decode(authToken, {complete: true}) ;
        let payload = decoded.payload ;
        let fool=await User.findOne({'email':payload.email})
        if(fool!=null) return res.json({ success: true})
        return res.json({ success: false})
    } catch (error) {
        console.log(error)
        return res.json({success:false})
    }
    
})
router.post("/getUserDetails",async(req,res)=>{
    try {
        let authToken=req.body.authToken
        let decoded = jwt.decode(authToken, {complete: true}) ;
        let payload = decoded.payload ;
        // console.log("payload" , payload)
        return res.json({ success: true,data:payload })
    } catch (error) {
        console.log(error)
        return res.json({success:false,message:"something went wrong try again later"})
    }
    
})

router.post("/getData",async(req,res)=>{
    try {
        let fetched_data = mongoose.connection.db.collection("pastdatas");
            fetched_data.find({}).toArray(async function(err, dataPast) {
                if(err) console.log(err);
                else{
                    dataCurrent=await currentData.findOne({id:1})
                    return res.json({ success: true,'pastData':dataPast,'currentData':dataCurrent})
                }
        })
    } catch (error) {
        return res.json({success:false,message:"something went wrong try again later"})
    }
})

module.exports = router;
