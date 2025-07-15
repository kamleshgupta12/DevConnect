const OTP = require('../models/OTP');
const User = require('../models/User');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const Profile = require('../models/Profile')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { OAuth2Client } = require('google-auth-library');
const { default: axios } = require('axios');
const CLIENT_ID = 'Ov23ligfc6pF1NY0FC8f';
const CLIENT_SECRET = 'e7b569453ef21dd815f4116095aa2447ff38d1d8';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const UserEnvironment = require('../models/Detect');
const { getClientIp } = require('../utils/ipUtills');

// send OTP 

exports.sendotp = async (req, res) => {
    try {
        const { email } = req.body;

        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User is already registered',
            });
        }

        let otp;
        let otpExists;
        do {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            otpExists = await OTP.findOne({ otp });
        } while (otpExists);

        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);

        if (!otpBody) {
            return res.status(500).json({
                success: false,
                message: 'Failed to store OTP',
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp,
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};


exports.signup = async (req, resp) => {
    try {
        const { firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp } = req.body;



        if (!firstName || !lastName || !password || !confirmPassword || !otp) {
            return resp.status(403).json({
                success: false,
                message: "all fields are required",
            })
        }

        // password match 

        if (password !== confirmPassword) {
            return resp.status(400).json({
                success: false,
                message: "Password does not match>>"
            })
        }


        // user alredy exist or not 

        const existUser = await User.findOne({ email });
        if (existUser) {
            return resp.status(400).json({
                success: false,
                message: "User Alredy Registered>>"
            })
        }

        // find recent otp 

        const recentOtp = await OTP.findOne({ email }).sort({ createAt: -1 }).limit(1);
        console.log(recentOtp);

        // validate OTP 


        if (recentOtp.length == 0) {
            return resp.status(400).json({
                success: false,
                message: "OTP Found"
            })
        } else if (otp !== recentOtp.otp) {
            return resp.status(400).json({
                success: false,
                message: "Invailid OTP"
            })
        }


        // hash passsword  


        const hashedPassword = await bcrypt.hash(password, 10);


        // entry create IN DB 

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,

        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return resp.status(200).json({
            success: true,
            message: "User register Successfully....",
            user,
        })
    }
    catch (error) {
        console.log(error)
        return resp.status(500).json({
            success: false,
            message: "Somethinfs went wrongs.."
        })
    }
}

// login 

exports.login = async (req, resp) => {
    try {
        // get data from body 

        const { email, password } = req.body;

        // validation 

        if (!password || !email) {
            return resp.status(403).json({
                success: false,
                message: "all field are required"
            })
        }

        // user exist or not 
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return resp.status(401).json({
                success: false,
                message: "user not register please SignUp",
            })
        }

        // generate JWT after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            })
            user.token = token;
            user.password = undefined;


            // create cookie and send request 
            const options = {
                expires: new Date(Date.now() + 3 * 34 * 60 * 60 * 100)
            }
            resp.cookie("token", token, options).status(200).json({
                success: true,
                message: "Logged in succcessfully",
                user,
                token,
            })
        }
        else {
            return resp.status(401).json({
                message: "Password incorrect",
                success: false,
            })
        }
    }
    catch (error) {
        console.log(error)
        return resp.status(500).json({
            success: false,
            message: "Please Try again..."
        })
    }
}


// change password 


exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old and new password are required",
            });
        }

        // Fetch user details
        const userDetails = await User.findById(req.user.id);
        if (!userDetails || !userDetails.password) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        console.log("User ID:", req.user.id);
        console.log("Old Password Entered:", oldPassword);
        console.log("Stored Hashed Password:", userDetails.password);

        // Compare passwords
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        );

        console.log("Password Match Status:", isPasswordMatch);

        if (!isPasswordMatch) {
            console.error("❌ Incorrect password!");
            return res.status(401).json({
                success: false,
                message: "The password is incorrect",
            });
        }

        // Hash new password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        // Send notification email
        try {
            await mailSender(
                userDetails.email,
                "Password Updated",
                passwordUpdated(
                    userDetails.email,
                    `Hello ${userDetails.firstName}, your password has been updated successfully.`
                )
            );
        } catch (emailError) {
            console.error("⚠️ Error sending email:", emailError);
        }

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("❌ Error updating password:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};



exports.googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: "No token provided" });
        }

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ success: false, message: "Invalid Google token" });
        }

        // Check if user exists in the database
        let user = await User.findOne({ email: payload.email });

        if (!user) {
            
            const profile = new Profile({
                firstName: payload.given_name || "FirstName", 
                lastName: payload.family_name || "LastName",  
                bio: "This user has not provided a bio.", 
                socialLinks: [] 
            });

            await profile.save();
            user = new User({
                email: payload.email,
                fullName: payload.name,
                image: payload.picture,
                role: "User", 
                accountType: "User", 
                additionalDetails: profile._id, 
                password: "", 
                courses: [],
                courseProgress: []
            });

            await user.save();
            console.log(` New user registered: ${payload.email}`);
        } else {
            console.log(` User logged in: ${payload.email}`);
        }

        // Generate JWT Token
        const jwtpayload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType
        }
        const jwttoken = jwt.sign(jwtpayload, process.env.JWT_SECRET, {
            expiresIn: "24h"
        })
        user.token = token;
        user.password = undefined;


        // create cookie and send request 
        const options = {
            expires: new Date(Date.now() + 3 * 34 * 60 * 60 * 100)
        }
        res.cookie("token", jwttoken, options).status(200).json({
            success: true,
            message: "Logged in succcessfully",
            user,
            token,
        })

        // return res.status(200).json({
        //     success: true,
        //     message: user ? "User signed in successfully with Google." : "User signed up successfully with Google.",
        //     user: {
        //         id: user._id,
        //         email: user.email,
        //         fullName: user.fullName,
        //         role: user.role,
        //         image: user.image,
        //     },
        // });

    } catch (error) {
        console.error(" Google Authentication Error:", error);
        return res.status(500).json({
            success: false,
            message: "Google authentication failed",
            error: error.message,
        });
    }
};


exports.githubAuth = async (req, res) => {
    try {
        const code = req.query.code;

        if (!code) {
            return res.status(400).json({ error: 'Missing authorization code' });
        }

        const bodyParams = new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
        });

        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: bodyParams.toString(),
        });

        const data = await response.json();
        console.log('Access Token Response:', data);

        if (data.error) {
            return res.status(400).json({ error: data.error });
        }

        res.json(data);
    } catch (error) {
        console.error('Error during GitHub authentication:', error);
        res.status(500).json({ message: 'Error during GitHub authentication' });
    }
};



exports.getGithubUser = async (req, res) => {
    const authorizationHeader = req.get("Authorization");

    if (!authorizationHeader) {
        return res.status(401).json({
            success: false,
            message: "Access token is missing."
        });
    }

    try {
        const githubResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: authorizationHeader }
        });

        console.log("GitHub API Response:", githubResponse.data);

        const { id, name, avatar_url } = githubResponse.data;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "GitHub user ID not found."
            });
        }

        // Fetch user email separately if not provided
        let email = githubResponse.data.email;
        if (!email) {
            const emailResponse = await axios.get("https://api.github.com/user/emails", {
                headers: { Authorization: authorizationHeader }
            });

            console.log("GitHub Email API Response:", emailResponse.data);
            email = emailResponse.data.find(e => e.primary)?.email || "";
        }

        // Check if user exists
        let user = await User.findOne({ githubId: id });
        if (!user) {
            user = new User({
                githubId: id,
                fistName: name || "GitHub User",
                email: email || "",
                image: avatar_url || '',
                accountType: 'User'
            });

            await user.save();
        }

        // Generate JWT token
        const payload = {
            email: user.email,
            fistName: user.fullName,
            image: user.image,
            accountType: user.role,
            githubId: user.githubId
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            success: true,
            message: "User signed in successfully with GitHub.",
            data: user,
            token
        });

    } catch (error) {
        console.error("GitHub Authentication Error:", error.response?.data || error.message);

        res.status(error.response?.status || 500).json({
            success: false,
            message: "Failed to verify GitHub token.",
            error: error.response?.data || error.message
        });
    }
};



const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.detect = async (req, res) => {
  try {
    const userData = req.body;
    
    // Transform network data to match schema
    const networkData = {
      type: userData.network?.type?.toLowerCase() || 'unknown',
      downlink: Number(userData.network?.downlink) || 0,
      rtt: Number(userData.network?.rtt) || 0
    };

    // Ensure network type is one of the allowed values
    const allowedNetworkTypes = ['wifi', 'cellular', 'ethernet', 'unknown', '4g', '3g', '2g'];
    if (!allowedNetworkTypes.includes(networkData.type)) {
      networkData.type = 'unknown';
    }

    // Create the complete data object
    const environmentRecord = new UserEnvironment({
      ...userData,
      network: networkData,
      // Include other transformations as needed
    });

    await environmentRecord.save();
    
    res.status(200).json({ 
      success: true,
      message: 'User environment data saved successfully'
    });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save user environment data',
      details: error.message
    });
  }
};