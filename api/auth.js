const express = require('express');
const router = express.Router();
const getDatabase = require('../utils/getDatabase')
const db = getDatabase()
const createError = require('http-errors')

const generateBearerToken = require("../utils/generateBearerToken")
const Auth = require("../models/Auth")
const User = require("../models/User")

const auth = new Auth()
const user = new User()

// Login
router.post('/login', async (req, res, next) => { 
    try {
        let body = req.body
        let data = db.prepare(
            `SELECT * FROM
            users WHERE
            username =  @username AND
            password = @password
            `).all(body)
        
        if (data.length == 1) {
            let token = generateBearerToken()
            let payload = {
                token: token,
                username: data[0].username,
                email: data[0].email,
                user_id: data[0].user_id,
                is_admin: data[0].is_admin
            }
            auth.add(data[0].user_id, token)
            res.send(payload)
        } else {
            return next(createError.Unauthorized('No account found with those credentials'))
        }
    } catch (err) {
        next(err)
    }
});

router.post('/reset-password', async (req, res, next) => { 
    try {
        let body = req.body
        let data = db.prepare(
            `SELECT * FROM
            users WHERE
            reset_token =  @reset_token
            `).all({reset_token: body.reset_token})
        
        if (data.length == 1) {
            let token = generateBearerToken()
            let payload = {
                token: token,
                username: data[0].username,
                email: data[0].email,
                user_id: data[0].user_id,
                is_admin: data[0].is_admin
            }
            user.updatePassword(data[0].user_id, body.password)
            user.updateResetToken(data[0].user_id, null)
            auth.add(data[0].user_id, token)
            res.send(payload)
        } else {
            res.sendStatus(401)
        }
    } catch (err) {
        next(err)
    }
});



module.exports = router;