import { Router } from "express";
import { validateLoginForm } from "../public/js/form_validate.js";
import { login } from "../data/users.js";
const router = Router(); 

const pageTitle = 'Log In to ArtFinder Account'; 
const headerTitle = 'Log In to Your Account';
const navLink = [
    {link: "/", text:"home"}
]; 


router.route('/')
    .get(async (req, res)=>{
        res.render('login', {
            pageTitle, 
            headerTitle, 
            navLink
        })
    })
    .post(async (req, res)=>{
        let user; 
        try {
            validateLoginForm(
                req.body.username_input, 
                req.body.password_input
            ); 
            user = await login(
                req.body.username_input, 
                req.body.password_input
            );
        } catch  (e) {
            return res.status(400).render('login', {
                pageTitle, 
                headerTitle, 
                navLink, 
                hasError: true, 
                error: e
            }); 
        }
        req.session.user = user; 
        return res.redirect('/');
    })

export default router; 