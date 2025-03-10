const express = require('express')
const jwt = require('jsonwebtoken')

exports.auth = async (req, res, next) => {
    try {
        const  token  = req.headers.authorization.replace("Bearer ", "");
        // console.log(token, "Tokkken");
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token missing."
            })
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Token invalid."
            })
        }
        next()

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Somethings went wrong, Please try again."
        })
    }
}

exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(404).json({
                success: false,
                message: "This role only for Admin."
            })
        }
        next()
    } catch (error) {
        console.log(error);
        return res.status(501).json({
            success: false,
            message: "Role note verify."
        })
    }
}

exports.isUser = async (req, res, next) => {
    try {
        if (req.user.role !== "User") {
            return res.status(404).json({
                success: false,
                message: "This role only for User."
            })
        }
        next()
    } catch (error) {
        console.log(error);
        return res.status(501).json({
            success: false,
            message: "Role note verify."
        })
    }
}