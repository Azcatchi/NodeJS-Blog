// Constantes
const router = require('express').Router()
const ProgressBar = require('progress')
const bcrypt = require('bcryptjs')
const math = require('math')
const db = require('sqlite')
const Session = require('../models/sessions')
const User = require('../models/users')

// BDD
db.open('db.db').then(() => {
	return db.run('CREATE TABLE IF NOT EXISTS users (pseudo, pwd, email, firstname, lastname, createdAt, updatedAt)')
	}).then(() => {
		console.log('BDD : OK');
	}).catch((err) => {
		console.log(err)
})

// My profil
router.get('/me', (req, res) => {
	var token = Session.getToken(req)
	User.getId(token).then((userId) => {
		res.redirect('/users/'+userId)
	})
})

// Show User by Id
router.get('/:userId', (req, res) => {
	var token = Session.getToken(req)
	User.getId(token).then((thisUserId) => {
		User.getById(req.params.userId).then((user) => {
			if (user == '') return next()
			var notThisOne = true
			if (thisUserId == req.params.userId) notThisOne = false
			res.format({
				html: () => {
					res.render('users/show', {
						title: 'Utilisateur '+req.params.userId,
						user: user,
						suppr: '/users/'+req.params.userId+'?_method=DELETE',
						modif: '/users/'+req.params.userId+'/edit',
						notThisOne: notThisOne
					})
				},
				json: () => {
					res.send(user)
				}
			})
		}).catch((err) => {
			console.log(err)
		})
	})
})

router.all('*', (req, res) => {
	res.status(501)
	res.end("URL not valid")
})

module.exports = router
