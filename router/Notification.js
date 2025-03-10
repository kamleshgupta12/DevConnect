const express = require('express')
const router = express.Router()
const { getNotification, saveNotification, deleteNotification } = require('../controlles/Notification')

router.post('/notifications/:userId', saveNotification)
router.get('/get-notifications/:userId', getNotification)
router.delete('/notifications/clear/:userId', deleteNotification)


module.exports = router 