import {Router} from 'express';
const router = Router();

router.route('/').get(async (req, res) => {
    // code here for GET
});

router
    .route('/register')
    .get(async (req, res) => {
        // code here for GET
    })
    .post(async (req, res) => {
        // code here for POST
    });

router
    .route('/login')
    .get(async (req, res) => {
        // code here for GET
    })
    .post(async (req, res) => {
        // code here for POST
    });