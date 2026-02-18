const redisClient = require('../config/redis');
const Submission = require('../models/submission');
const User = require('../models/user');
const validate = require('../utils/validator');  // for the validate value we have to install validator library
const bcrypt = require('bcrypt');  //install library in your system for convert password in hashcode
const jwt = require('jsonwebtoken')  // install this in the system to create a token

const register = async (req,res)=>{ 
  try {

    // validate the data
    validate(req.body);


    const {firstName, emailId, password} = req.body;
  

    // password into hashform
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = 'user';

    
    // this email already exits or not
    const user = await User.create(req.body)

    // create jwt token for the user token for the  signup
    const token = jwt.sign({_id:user._id , emailId:emailId, role:'user'}, process.env.JWT_KEY, {expiresIn: 60*60});

    const reply={
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role:user.role,

    }
    res.cookie('token',token,{maxAge: 60*60*1000}); // ye cookie is token ko itne time baad expire kar dega

    res.status(201).json({
      user:reply,
      message:"signup Succesfully"
    })


  } catch (err) {
    res.status(400).send("Error: "+err);
  }
}


const login = async(req,res)=>{
  try {
    const {emailId, password} = req.body;

    if(!emailId)
      throw new Error("Invalid credential");
    if(!password)
      throw new Error("Invalid credential");

    const user = await User.findOne({emailId});  // if email exist here then user come here

     const match = await bcrypt.compare(password, user.password);  // yaha user ka password aur jo password body me save hai dono ka compare karenge
     if(!match)
      throw new Error("Invalid credntial");

     const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role:user.role,
     }

     const token = jwt.sign({_id:user._id , emailId:emailId, role:user.role}, process.env.JWT_KEY, {expiresIn: 60*60});
    res.cookie('token',token,{maxAge: 60*60*1000});  // again jwt token create
    res.status(201).json({
      user:reply,
      message:"Login Succesfully"
    })

  } catch (err) {
    res.status(401).send("Error: "+err);
  }
}

const logout = async(req,res)=>{
  try {

    // validate the token
    const {token} = req.cookies
    const payload = jwt.decode(token);

    await redisClient.set(`token:${token}`,'Blocked');
    await redisClient.expireAt(`token:${token}`,payload.exp);
    // teoken add kar denge redis ke blocklist
    // last mein cookie ko clear kar denge

    res.cookie("token",null,{expires: new Date(Date.now())});
    res.send("Logged Out succesfully")
    
  } catch (err) {
    res.status(503).send("Error: "+err);
  }
}

const adminRegister = async(req,res)=>{
  try {
    // validate the data
    validate(req.body);
    const{firstName, emailId, password} = req.body;

    req.body.password = await bcrypt.hash(password, 10);

    const user = await User.create(req.body);
    const token = jwt.sign({_id:user._id , emailId:emailId, role:user.role}, process.env.JWT_KEY, {expiresIn: 60*60});
    res.cookie('token',token,{maxAge: 60*60*1000});
    res.status(201).send("User Registered Successfully");


  } catch (err) {
    res.status(400).send("Error: " +err);
  }
}

const deleteProfile = async(req,res)=>{

  try {
    const userId = req.result._id
    // User Schema delete
    await User.findByIdAndDelete(userId)

    // now we will delete from Submission
    // await Submission.deleteMany({userId});

    res.status(200).send("Deleted Successfully");
  } catch (err) {
    res.status(500).send("Internal Server Error"+ err); 
  }

}

module.exports = {register,login,logout,adminRegister, deleteProfile};

/*const redisClient = require('../config/redis');
const submission = require('../model/submission');
const User = require('../model/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// ---------------- REGISTER ----------------
const register = async (req, res) => {
  try {
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    // Check existing user
    const existing = await User.findOne({ emailId });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    req.body.role = 'user';
    req.body.password = await bcrypt.hash(password, 10);

  //   console.log("/user/register HIT");    // PRINT 1
  // console.log("Body received:", req.body);  // PRINT 2

    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailId, role: 'user' },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie('token', token, { maxAge: 60 * 60 * 1000 });

    return res.status(201).json({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id
      },
      message: "Signup successfully"
    });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};


// ---------------- LOGIN ----------------
const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = await User.findOne({ emailId });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { _id: user._id, emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie('token', token, { maxAge: 60 * 60 * 1000 });

    return res.status(200).json({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id
      },
      message: "Login successful"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// ---------------- LOGOUT ----------------
const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    const payload = jwt.decode(token);

    await redisClient.set(`token:${token}`, 'Blocked');
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", null, { expires: new Date(Date.now()) });

    return res.json({ message: "Logged out successfully" });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// ---------------- ADMIN REGISTER ----------------
const adminRegister = async (req, res) => {
  try {
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);

    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie('token', token, { maxAge: 60 * 60 * 1000 });

    return res.status(201).json({ message: "Admin Registered Successfully" });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};


// ---------------- DELETE PROFILE ----------------
const deleteProfile = async (req, res) => {
  try {
    const userId = req.result._id;

    await User.findByIdAndDelete(userId);
    await submission.deleteMany({ userId });

    return res.status(200).json({ message: "Deleted Successfully" });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


module.exports = { register, login, logout, adminRegister, deleteProfile };*/
