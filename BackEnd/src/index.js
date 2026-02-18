// require('dotenv').config();
// const express = require('express');
// const app = express();
// const main = require('./config/db');
// const cookieParser = require('cookie-parser');
// const authRouter = require("./routes/userAuth");
// const redisClient = require('./config/redis');
// const problemRouter = require('./routes/problemCreator');
// const submitRouter = require('./routes/submit')
// const cors = require('cors')
// const aiRouter = require('./routes/aiChatting');
// const videoRouter = require("./routes/videoCreator")

// app.use(cors({
//   origin: 'http://localhost:5173',  // if we write * then anyone can access 
//   credentials: true
// }))

// app.use(express.json());
// app.use(cookieParser())

// app.use('/user',authRouter)
// app.use('/problem',problemRouter)
// app.use('/submission',submitRouter)
// app.use('/ai',aiRouter)
// app.use("/video",videoRouter)

// const InitalizeConnection = async()=>{
//   try {
//     await Promise.all([main(),redisClient.connect()]);
//     console .log("DB Connected");

//     app.listen(process.env.PORT, ()=>{
//       console.log("Server listening at port number: "+process.env.PORT)
//     })
//   }
//   catch (err) {
//     console.log("Error"+err)
//   }
// }

// InitalizeConnection()

// /*main()
// .then(async ()=>{
//     app.listen(process.env.PORT, ()=>{
//     console.log("Server listening at port number: "+ process.env.PORT);
//   })

// })

// .catch(err=> console.log("Error Occurred: "+err));*/



require('dotenv').config(); // MUST be first line

const express = require('express');
const app = express();
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const redisClient = require('./config/redis');

const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require('./routes/submit');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require("./routes/videoCreator");

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use("/video", videoRouter);

// Initialize DB and Redis connection
const initializeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log("DB Connected");

    // TEST env variables
    // console.log("PORT =>", process.env.PORT);
    // console.log("JUDGE0 KEY =>", process.env.JUDGE0_KEY);

    app.listen(process.env.PORT, () => {
      console.log("Server listening at port number: " + process.env.PORT);
    });
  } catch (err) {
    console.log("Error: " + err);
  }
};

initializeConnection();
