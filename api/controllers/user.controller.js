require('dotenv').config()

const {join} = require('path')
const sendMail = require(join(__dirname,"..", "workers", "sendEmail.worker"))