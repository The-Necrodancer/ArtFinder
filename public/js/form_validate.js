import { checkEmail, checkPassword, checkUsername } from "../../helpers.js"; 

/**
 * Throws if any inputs are not valid. 
 * @param {String} username Username of user
 * @param {String} email Email of user
 * @param {String} password Password of user
 * @param {String} passwordConfirmation Password Confirmation from register form
 * @param {String} isArist String from register form 
 */
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

/**
 * Throws if any inputs DNE or are invalid
 * @param {String} username Username from login form
 * @param {String} password Password from login form
 */
export const validateLoginForm = (
    username, 
    password
) => {
    username = checkUsername(username); 
    password = checkPassword(password); 
}