const express = require('express');
const router = express.Router();
const User = require("../models/User")
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "thisisjwtsecretline";
// creating a user at /api/auth/createuser and enables to enter email id password of user
try {
    router.post('/createuser', [
        body('name').isLength({ min: 3 }),
        body('email').isEmail(),
        body('password').isLength({ min: 5 }),
    ], async (req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }
        // finding if the user with the same email already exists or not.
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "sorry a user with this email already exists" })

        }
        //generating salt for the password of our user using bcrypt pacakage
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        })
        //generating token as a password for the user to keep it safe with its id and jwt secret
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        //getting token as a response
        success = true
        res.json({ success, authtoken });

    })
} catch (error) {
    console.error(error.message);
    res.status(500).send("some error occurred");
}

//after creating user login it with email and password and get token
router.post('/login', [

    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    //taking email and password
    const { email, password } = req.body;
    try {
        //checking if the user exists or not.
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            success = false
            return res.status(400).json({ success, error: "sorry a user with this email not exists" })

        }
        //comparing password entered by user and generated bys user bcrypt
        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ error: "please enter correct information" })

        }
        const data = {
            user: {
                id: user.id
            }
        }
        //getting token in response
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server failed")
    }
})
// after login third route is to get the user by its auth token and verify it.
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        //getting userId by the middleware fetchuser and display all information of user accept its password.
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("inetrnal server error");
    }
})
module.exports = router