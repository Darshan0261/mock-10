const nodemailer = require('nodemailer');

require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
        user: 'laurel.doyle3@ethereal.email',
        pass: 'DsR3ezWf7ZMr8fssVv'
    }
});

module.exports = {
    transporter
}