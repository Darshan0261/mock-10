const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const { UserModel } = require('../models/User.model');
const { transporter } = require('../configs/nodemailer')

const userRouter = express.Router();

userRouter.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send({ message: 'Username, Email and Password Required' });
    }
    try {
        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return res.status(409).send({ message: 'User already registered' });
        }
        bcrypt.hash(password, +process.env.saltRounds, async function (err, hashedPass) {
            if (err) {
                return res.status(501).send({ message: err.message });
            }
            try {
                const user = new UserModel({
                    username, email, password: hashedPass
                })

                const mail = await transporter.sendMail({
                    from: 'laurel.doyle3@ethereal.email',
                    to: email,
                    subject: 'Email Verification for Chat App',
                    text: `Click on link to Verify Email ${process.env.DEPLOY_LINK}/users/verify/${user._id}`,
                })

                await user.save();

                res.send({ message: 'Verification link send to email', link: `${process.env.DEPLOY_LINK}/users/verify/${user._id}` })
            } catch (error) {
                res.status(501).send({ message: error.message })
            }
        });

    } catch (error) {
        return res.status(501).send({ message: error.message })
    }
})

userRouter.get('/info', async (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.send({ message: 'Login to Continue' });
    }
    try {
        const tokenDecode = jwt.decode(token);
        let _id = tokenDecode.id;
        const user = await UserModel.findOne({ _id: _id });
        if (!user) {
            return res.status(501).send({ message: 'User not Found' })
        }
        res.send(user);
    } catch (error) {
        res.status(501).send({ message: error.message })
    }
})

userRouter.get('/verify/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await UserModel.findOne({ _id: id });
        if (!user) {
            return res.status(404).send({ message: 'User Not Found' });
        }
        user.verified = true;
        await user.save();
        res.send({ message: 'User Verified Sucessfully' });
    } catch (error) {
        res.status(501).send({ message: error.message })
    }
})

userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: 'Email and Password Required' });
    }
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: 'User not Registered' });
        }
        if (user.verified == false) {
            return res.status(409).send({ message: 'User Verification not done' });
        }
        bcrypt.compare(password, user.password, async function (err, result) {
            if (err) {
                return res.status(501).send({ message: err.message });
            }
            if (!result) {
                return res.status(401).send({ message: 'Wrong Credentials' });
            }
            const token = jwt.sign({ id: user._id }, process.env.privateKey);
            res.send({ message: 'Login Sucessful', token });
        });
    } catch (error) {
        res.status(501).send({ message: error.message })
    }
})

module.exports = {
    userRouter
}