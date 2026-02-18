const validator = require('validator');

const validate = (data)=>{  // all data present in the data
  const mandatoryField = ['firstName','emailId','password']
  const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k)); //only array of key from object  and k belongs in mandatory field

  if(!IsAllowed)
    throw new Error("Some Field Missing")

  if(!validator.isEmail(data.emailId))
    throw new Error("Invalid Email");

  if(!validator.isStrongPassword(data.password))
    throw new Error("Week password");

}

module.exports = validate;