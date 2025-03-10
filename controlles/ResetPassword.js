const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');
const crypto = require('crypto')


exports.resetPasswordToken = async (req, resp) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({ email: email });
        if (!user) {
            return resp.status(400).json({
                success: false,
                message: "Your Email Not Registered with us"
            })
        }
        // generate token 
        const token = crypto.randomUUID();
        // update user by adding token and expiration 

        const updatedDetails = await User.findOneAndUpdate({ email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000,
            },
            { new: true }
        );
        // create url 

        const url = `${process.env.REACT_APP_BASE_URL}/update-password/${token}`


        // send mail \\

        await mailSender(email, "Password Reset Link",
            `Password Reset Link ${url}`
        );


        return resp.status(200).json({
            success: true,
            message: "Email send Successfully..  "
        })
    }
    catch (error) {
        console.log(error)
    }
}



exports.resetPassword = async (req, resp) => {
    try {
        // data fetch  
        const { password, confirmPassword, token } = req.body;
        if (password !== confirmPassword) {
            return resp.json({
                success: false,
                message: "Password Not match.."
            })
        }
        // user details from DB by token 
        const userDetails = await User.findOne({ token: token })
        if (!userDetails) {
            return resp.json({
                success: false,
                message: "Token invalid"
            });

        }

        // token time 

        if (userDetails.resetPasswordExpires < Date.now()) {
            return resp.json({
                success: false,
                message: "tOKEN EXPIRE PLEASE GENERATE NEW TOKEN",
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // password update 

        await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true }
        )

        return resp.status(200).json({
            success: true,
            message: "Password Reset Successfully..."
        })
    }
    catch (error) {
        console.log(error)
        return resp.status(500).json({
            success: false,
            message: "Something went wrong while sending reset password email"
        })
    }
}