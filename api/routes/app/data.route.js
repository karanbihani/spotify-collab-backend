require('dotenv').config()

const { join } = require('path')
const { route } = require('../../..')
const router = require('express').Router()
const data = require(join(__dirname, '..', '..', '..', 'controllers', 'data.controller'))

route.post('/add', data.add(req,res))
route.get('/', data.add(req,res))
route.post('/callback', data.callback(req, res))