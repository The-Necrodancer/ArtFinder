import { checkEmail, checkPassword, checkUsername } from "../../helpers.js"; 

export const validateReigsterForm = (
    username, 
    email, 
    password, 
    passwordConfirmation, 
    isArist 
) => {
    username = checkUsername(username); 
    email = checkEmail(email); 
    password = checkPassword(password); 
    if(typeof passwordConfirmation !== 'string') 
        throw 'Error: confirm password expected a string.'; 
    if(!passwordConfirmation || !passwordConfirmation.trim())
        throw 'Error: please confirm your password.'; 
    if(password !== passwordConfirmation.trim()) 
        throw `Error: passwords do not match`; 
    if(!isArist || typeof isArist !== 'string') 
        throw 'Error: whether the user is an artist must be supplied as a string.'; 
    if(isArist !== 'Yes' && isArist !== 'No')
        throw "Error: acceptable values for whether a user is an artist are only 'Yes' and 'No'."; 
}; 

export const validateLoginForm = (
    username, 
    password
) => {
    username = checkUsername(username); 
    password = checkPassword(password); 
}