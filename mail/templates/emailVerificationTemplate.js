const otpTemplate = (otp) => {
    return `<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>OTP Verification Email</title>
</head>

<body style="background-color: #f0f2f5; font-family: 'Roboto', Arial, sans-serif; font-size: 16px; color: #333; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 50px auto; padding: 40px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); text-align: center;">
        <a href="#" style="text-decoration: none; font-size: 24px; font-weight: bold; color: #308d46;">--SquadMinds--</a>
        <div style="font-size: 22px; color: #444444; font-weight: bold; margin-bottom: 15px;">Verify Your Account</div>
        <div style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 25px;">
            <p>Hello,</p>
            <p>Thank you for joining DevConnect! To complete your registration, please use the following OTP to verify your account:</p>
            <h2 style="font-size: 28px; color: #308d46; font-weight: bold; margin: 20px 0;">${otp}</h2>
            <p>This OTP is valid for the next 5 minutes. If you did not request this, simply ignore this message.</p>
        </div>
        <div style="font-size: 14px; color: #888888; margin-top: 30px;">Need help? Contact us at <a href="mailto:kgupta.squad@gmail.com" style="color: #1a73e8; text-decoration: none;">kguptasquad@gmail.com</a>.</div>
        <footer style="font-size: 13px; color: #aaaaaa; margin-top: 40px;">&copy; 2024 SquadMinds Pvt Ltd. All rights reserved.</footer>
    </div>
</body>

</html>`;
};

module.exports = otpTemplate;
