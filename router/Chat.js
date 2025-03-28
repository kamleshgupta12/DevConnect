const express = require('express')
const { Message } = require('../controlles/chatMessage')
const router = express.Router()

router.get('/:senderId/:receiverId',Message )


module.exports = router 