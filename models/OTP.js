const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate =  require('../mail/templates/emailVerificationTemplate')

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createAt: {
        type: String,
        default: Date.now(),
        expires: 5 * 60
    }
})

// function for send mail 

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Code from DevConnect ", emailTemplate(otp));
        console.log("Email send Successfully", mailResponse);
    }
    catch (error) {
        console.log("error accured while sending email", error)
    }
}

OTPSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})


module.exports = mongoose.model("OTP", OTPSchema);