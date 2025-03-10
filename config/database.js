const mongoose = require('mongoose')
require('dotenv').config()

exports.DBConnection = () => {
    mongoose.connect(process.env.DATABASE_URL).then(() => {
        console.log("DB Connected Sucessfully.")
    }).catch((error) => {
        console.log("DB not connect, Please try again.")
        console.log(error)
        process.exit(1)
    })
}



