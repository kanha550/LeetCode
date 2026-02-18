// const Problem = require("../models/problem");
// const Submission = require("../models/submission");
// const User = require("../models/user");
// const {getLanguageById, submitBatch, submitToken} = require("../utils/problemUtility")
// const submitCode = async (req , res)=>{
//   try {
//     const userId = req.result._id;
//     const problemId = req.params.id;

//     let {code, language} = req.body;
//     if(!userId||!code||!problemId||!language)
//       return res.status(400).send("Some field missing");

//     if(language==='cpp')
//       language='c++';

//     // Fetch the problem from the database
//     const problem = await Problem.findById(problemId);
//     // testcases (hidden)

//     // Kya apne submission store kara du pahle bina judge0 ko diye...
    
  
//     const submittedResult = await Submission.create({
//       userId,
//       problemId,
//       code,
//       language,
//       // testCasesPassed,
//       status:'pending',
//       testCasesTotal:problem.hiddenTestCases.length
//     })

//     // Judge0 code ko submit karna hai

//     const languageId = getLanguageById(language);

//     const submissions = problem.hiddenTestCases.map((testcase)=>({
//       source_code:code,
//       language_id: languageId,
//       stdin: testcase.input,
//       expected_output: testcase.output
//     }));

//     const submitResult = await submitBatch(submissions);

//     const resultToken = submitResult.map((value)=> value.token);

//     const testResult = await submitToken(resultToken);

//     // submission ko update karna hai ki kitna testcase pass hua hai
//     let testCasesPassed = 0;
//     let runtime = 0;
//     let memory = 0;
//     let status = 'accepted';
//     let errorMessage = null;

//     for(const test of testResult){
//       if(test.status_id===3){
//         testCasesPassed++
//         runtime = runtime+parseFloat(test.time)
//         memory = Math.max(memory, test.memory);
//       }
//       else{
//         if(test.status_id==4){
//           status = 'error'
//           errorMessage = test.stderr
//         }
//         else
//           status = 'wrong'
//           errorMessage = test.stderr
//       }
//     }

//     // Store the result in DataBase in Submission
//     submittedResult.status = status;
//     submittedResult.testCasesPassed = testCasesPassed;
//     submittedResult.errorMessage = errorMessage;
//     submittedResult.runtime = runtime;
//     submittedResult.memory = memory;

//     await submittedResult.save();

//     // we will insert problem id in the  Problem Solved which is present in the useschema If it is not present there

//    if(!req.result.problemSolved.includes(problemId)){
//     req.result.problemSolved.push(problemId)
//     await req.result.save();
//    }

//     const accepted = (status == 'accepted')
//     res.status(201).json({
//       accepted,
//       totalTestCases: submittedResult.testCasesTotal,
//       passedTestCases: testCasesPassed,
//       runtime,
//       memory
//     });

//   } catch (err) {
//     res.status(500).send("Internal Server error: "+ err)
//   }
// }


// const runCode = async (req , res)=>{
//   try {
//     const userId = req.result._id;
//     const problemId = req.params.id;

//     let {code, language} = req.body;
//     if(!userId||!code||!problemId||!language)
//       return res.status(400).send("Some field missing");

//     // Fetch the problem from the database
//     const problem = await Problem.findById(problemId);
//     // testcases (hidden)
//     if(language==='cpp')
//         language='c++'

//     // Kya apne submission store kara du pahle bina judge0 ko diye...
    


//     // Judge0 code ko submit karna hai

//     const languageId = getLanguageById(language);

//     const submissions = problem.visibleTestCases.map((testcase)=>({
//       source_code:code,
//       language_id: languageId,
//       stdin: testcase.input,
//       expected_output: testcase.output
//     }));

//     const submitResult = await submitBatch(submissions);

//     const resultToken = submitResult.map((value)=> value.token);

//     const testResult = await submitToken(resultToken);

//    let testCasesPassed = 0;
//     let runtime = 0;
//     let memory = 0;
//     let status = true;
//     let errorMessage = null;

//     for(const test of testResult){
//         if(test.status_id==3){
//            testCasesPassed++;
//            runtime = runtime+parseFloat(test.time)
//            memory = Math.max(memory,test.memory);
//         }else{
//           if(test.status_id==4){
//             status = false
//             errorMessage = test.stderr
//           }
//           else{
//             status = false
//             errorMessage = test.stderr
//           }
//         }
//     }

   
  
//    res.status(201).json({
//     success:status,
//     testCases: testResult,
//     runtime,
//     memory
//    });

//   } 
//   catch (err) {
//     res.status(500).send("Internal Server error: "+ err)
//   }
// }



// module.exports = {submitCode,runCode};





// /*
// #include <iostream>\nusing namespace std;\n\nint main(){\n    int a, b;\n   cin >> a >> b;\n   cout << a + b;\n   retrun 0;\n}
// */

const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {
  getLanguageById,
  submitBatch,
  submitToken
} = require("../utils/problemUtility");


// ===================== SUBMIT CODE =====================
const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language) {
      return res.status(400).send("Some field missing");
    }

    if (language === "cpp") language = "c++";

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }

    // Create submission (pending)
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length
    });

    const languageId = getLanguageById(language);

    const submissions = problem.hiddenTestCases.map(tc => ({
      source_code: code,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.output
    }));

    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map(v => v.token);
    const testResult = await submitToken(tokens);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;
        runtime = Math.max(runtime, parseFloat(test.time || 0));
        memory = Math.max(memory, test.memory || 0);
      } else {
        if (status === "accepted") {
          status =
            test.status_id === 4 ? "wrong" : "error";
          errorMessage =
            test.stderr ||
            test.compile_output ||
            test.message ||
            "Execution Error";
        }
      }
    }

    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;
    submittedResult.errorMessage = errorMessage;

    await submittedResult.save();

    // Add problem to solved list ONLY if accepted
    if (
      status === "accepted" &&
      !req.result.problemSolved.includes(problemId)
    ) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    res.status(201).json({
      accepted: status === "accepted",
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory
    });

  } catch (err) {
    res.status(500).send("Internal Server Error: " + err.message);
  }
};


// ===================== RUN CODE =====================
const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language) {
      return res.status(400).send("Some field missing");
    }

    if (language === "cpp") language = "c++";

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }

    const languageId = getLanguageById(language);

    const submissions = problem.visibleTestCases.map(tc => ({
      source_code: code,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.output
    }));

    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map(v => v.token);
    const testResult = await submitToken(tokens);

    let runtime = 0;
    let memory = 0;
    let success = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        runtime = Math.max(runtime, parseFloat(test.time || 0));
        memory = Math.max(memory, test.memory || 0);
      } else {
        success = false;
        errorMessage =
          test.stderr ||
          test.compile_output ||
          test.message ||
          "Execution Error";
        break;
      }
    }

    res.status(201).json({
      success,
      testCases: testResult,
      runtime,
      memory,
      errorMessage
    });

  } catch (err) {
    res.status(500).send("Internal Server Error: " + err.message);
  }
};


module.exports = { submitCode, runCode };
