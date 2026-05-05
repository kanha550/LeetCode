/*const mongoose = require('mongoose')
const {Schema} = mongoose;

const userSchema = new Schema({
  firstName:{
    type:String,
    required:true,
    minLength:3,
    maxLength:20
  },

  lastName:{
    type:String,
    minLength:3,
    maxLength:20
  },

  emailId:{
    type:String,
    unique:true,
    required:true,
    trim:true,
    lowercase:true,
    immutable:true,
  },

  age:{
    type:Number,
    min:10,
    max:80,
  },

  role:{
    type:String,
    enum:['user','admin'],
    default:'user'
  },

  problemSolved:{
    type:[{
      type:Schema.Types.ObjectId,
      ref:'problem'
    }],
    unique:true
  },
  password:{
    type:String,
    required:true
  }
  
}, {timestamps:true});

userSchema.post('findOneAndDelete', async function (userInfo){
  if(userInfo){
    await mongoose.model('submission').deleteMany({userId: userInfo._id});   // Here post means execute hone ke baad mein delete hoga and jaha kahi bhi pre ho waha pahle delete hoga
  }
})

const User = mongoose.model("user",userSchema)

module.exports = User;*/

const mongoose = require('mongoose')
const {Schema} = mongoose;

const userSchema = new Schema({
  firstName:{
    type:String,
    required:true,
    minLength:3,
    maxLength:20
  },

  lastName:{
    type:String,
    minLength:3,
    maxLength:20
  },

  emailId:{
    type:String,
    unique:true,
    required:true,
    trim:true,
    lowercase:true,
    immutable:true,
  },

  age:{
    type:Number,
    min:10,
    max:80,
  },

  role:{
    type:String,
    enum:['user','admin'],
    default:'user'
  },

  problemSolved:{
    type:[{
      type:Schema.Types.ObjectId,
      ref:'problem',
      unique:true
    }],
  },

  password:{
    type:String,
    required: function() {
      return !this.googleId && !this.githubId;
    }
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true
  },

  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  profilePicture: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${this.firstName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    }
  },

  bio: {
    type: String,
    maxLength: 200,
    default: "Passionate Coder"
  },

  education: {
    type: String,
    maxLength: 100,
    default: "N/A"
  }
  
}, {timestamps:true});

userSchema.post('findOneAndDelete', async function (userInfo){
  if(userInfo){
    await mongoose.model('submission').deleteMany({userId: userInfo._id});
  }
})

const User = mongoose.model("user",userSchema)

module.exports = User;
