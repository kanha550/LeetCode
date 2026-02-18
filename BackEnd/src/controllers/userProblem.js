const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility")
const Problem = require("../models/problem")
const Submission = require("../models/submission");
const User = require("../models/user");
const SolutionVideo = require("../models/solutionVideo")

const createProblem = async(req,res)=>{
  const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator } = req.body;

  try {
    
// console.log(referenceSolution)

for (const { language, completeCode } of referenceSolution) {

    

      // source code:
      // language_id:
      // stdin:
      // expected Output:

      const languageId = getLanguageById(language);


      // I am creating Batch submission
      const submissions = visibleTestCases.map((testcase)=>({
        source_code:completeCode,
        language_id:languageId,
        stdin: testcase.input,
        expected_output: testcase.output,

      }));

      const submitResult = await submitBatch(submissions);

      const resultToken = submitResult.map((value)=>value.token);
      // console.log(resultToken)

      const testResult = await submitToken(resultToken);
      // console.log(testResult)

      for(const test of testResult){
        if(test.status_id==3){
          return res.status(400).send("Error Occured")
        }
      }
    }
    // We can store in our DB

    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id
    });

    res.status(201).send("Problem saved successfully");

  } catch (err) {
    res.status(400).send("Error: "+err);
  }
}



const updateProblem = async(req,res)=>{
  const {id} = req.params
  const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases, startCode,referenceSolution,problemCreator} = req.body;

  try {

    if(!id){
      return res.status(400).send("Missing ID Field");
    }

    const DsaProblem =await Problem.findById(id);
    if(!DsaProblem)
    {
      return res.status(404).send("ID is not Present in Server")
    }

    for(const {language,completeCode} of referenceSolution){

      // source code:
      // language_id:
      // stdin:
      // expected Output:

      const languageId = getLanguageById(language);


      // I am creating Batch submission
      const submissions = visibleTestCases.map((testcase)=>({
        source_code:completeCode,
        language_id:languageId,
        stdin: testcase.input,
        expected_output: testcase.output
      }));

      const submitResult = await submitBatch(submissions);

      const resultToken = submitResult.map((value)=>value.token);

      const testResult = await submitToken(resultToken);

      for(const test of testResult){
        if(test.status_id==3){
          return res.status(400).send("Error Occured")
        }
      }
    }

    const newProblem = await Problem.findByIdAndUpdate(id, {...req.body},{runValidators:true,new:true});

    res.status(200).send(newProblem);
    
  } 

  catch (err) {
    res.status(500).send("Error: "+err);
  }
}

const deleteProblem = async(req,res)=>{
  const {id} = req.params;
  try {
    
    if(!id){
      return res.status(400).send("ID is mising")
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);
    if(!deletedProblem)
      return res.status(404).send("Problem is Missing");

    res.status(200).send("Successfully Deleted")

  } catch (err) {
    res.status(500).send("Error: "+err);
  }
}

const getProblemById = async(req,res)=>{
  const {id} = req.params;
  try {
    
    if(!id){
      return res.status(400).send("ID is mising")
    }

    // -hiddentestcases we can only remove hidden tes case
    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode ReferenceSolution')
    if(!getProblem)
      return res.status(404).send("Problem is Missing");

    const videos = await SolutionVideo.findOne({problemId:id});
    
       if(videos){   
        
       const responseData = {
        ...getProblem.toObject(),
        secureUrl:videos.secureUrl,
        thumbnailUrl : videos.thumbnailUrl,
        duration : videos.duration,
       } 
      
       return res.status(200).send(responseData);
       }

    res.status(200).send(getProblem)

  } catch (err) {
    res.status(500).send("Error: "+err);
  }
}

const getAllProblem = async(req,res)=>{
  
  try {
    

    const getProblem = await Problem.find({}).select('_id title difficulty tags');
    if(getProblem.length==0)
      return res.status(404).send("Problem is Missing");

    res.status(200).send(getProblem)

  } catch (err) {
    res.status(500).send("Error: "+err);
  }
}

const solvedAllProblembyUser = async(req,res)=>{
  try {
    const userId = req.result._id;

    const user = await User.findById(userId).populate({
      path:"problemSolved",
      select:"_id title difficulty tag"
    });  //populate ke help se ye problemsolved jisko refer kerengi wo pura information aa jayega

    res.status(200).send(user.problemSolved);

  } catch (err) {
    res.status(500).send("Server Error")
  }
}

const submittedProblem = async(req,res)=>{
  try {
    
    const userId = req.result._id;
    const problemId = req.params.pid;

    const ans = await Submission.find({userId,problemId});
    if(ans.length==0)
      res.status(200).send("No Submission is present");

    res.status(200).send(ans)

  } catch (err) {
    res.status(500).send("Inernal server Error" +err)
  }
}

module.exports = {createProblem,updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblembyUser, submittedProblem};