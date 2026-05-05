const express = require('express');
const authRouter = express.Router();
const {register,login,logout,adminRegister, deleteProfile, getUserProfile, updateProfile, generateProfilePicSignature} = require('../controllers/userAuthent')
const userMiddleware = require('../middleware/userMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

const passport = require('passport');
const jwt = require('jsonwebtoken');

// Register
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout',userMiddleware, logout)
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete('/deleteProfile', userMiddleware, deleteProfile)
authRouter.get('/getProfile', userMiddleware, getUserProfile)
authRouter.put('/updateProfile', userMiddleware, updateProfile)
authRouter.get('/profilePicSignature', userMiddleware, generateProfilePicSignature)

// --- Social Auth Routes ---
authRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/auth/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // req.user is populated by passport
    const token = jwt.sign(
      { _id: req.user._id, emailId: req.user.emailId, role: req.user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
    
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000 
    });

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

authRouter.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
authRouter.get('/auth/github/callback', 
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { _id: req.user._id, emailId: req.user.emailId, role: req.user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
    
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000 
    });

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

authRouter.get('/check',userMiddleware,(req,res)=>{
  const reply = {
    firstName: req.result.firstName,
    emailId: req.result.emailId,
    _id: req.result._id,
    role:req.result.role,
  }

  res.status(200).json({
    user:reply,
    message:"valid User"
  });
})
// Login
// Logout
// Getprofile

module.exports=authRouter