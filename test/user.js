import { createUser, getUserById, getAllUsers } from "../data/users.js";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import bcrypt from 'bcrypt'; 
import { create } from "express-handlebars";

const testUserMethods = async () => {
    /*
    role,  
    username,
    email, 
    password */
    const db = await dbConnection();
    await db.dropDatabase();

    console.log( await getAllUsers()); 
    let password1 = await bcrypt.hash('password1', 10); 
    let user1 = await createUser('user', 'meow67', 'meow67@gmail.com',  password1); 
    console.log(user1); 
    console.log(await getAllUsers); 
    let password2 = await bcrypt.hash('password1', 10); 
    let user2 = await createUser('artist', 'aaaaa', 'aaaa@gmail.com', password2); 

    console.log(user2); 
    console.log(await getAllUsers); 

}; 

export default testUserMethods; 
