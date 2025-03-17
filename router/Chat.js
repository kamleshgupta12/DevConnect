const express = require('express')
const { chat } = require('../controlles/chatMessage')
const router = express.Router()

router.get('/:userId/:otherUserId', chat)

module.exports = router 