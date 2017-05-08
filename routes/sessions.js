// Constantes
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const moment = require('moment')
const Session = require('../models/sessions')
const User = require('../models/users')
const Article = require('../models/articles')

// Date
function timeConverter(UNIX_timestamp){
	return moment(UNIX_timestamp).format("DD-MM-YYYY h:mm:ss")
}

// Render Todos
function renderArticles(res, articles) {
	var title = 'Mon blog'
	var hasArticles = true
	var affichage = true
	if (articles.length == 0) hasArticles = false
	var list = []
	for (var i = articles.length - 1; i >= 0; i--) {
		list.push(articles[i])
	}
	res.format({
		html: () => {
			res.render('connexion/connexion', {
				title: title,
				list: list,
				hasArticles: hasArticles,
				affichage: affichage
			})
		},
		json: () => {
			res.send({list: list})
		}
	})
}

router.get('/', (req, res, next) => {
	var token = Session.getToken(req)
	User.getId(token).then((userId) => {
		User.getById(userId).then((user) => {
			Article.getbyUserId(userId).then((articles) => {
				renderArticles(res, articles)
			})
		})
	})
})



// Session + Cookie
router.post('/', (req, res, next) => {
	if (req.body.pseudo == "" || req.body.pwd == "" || req.body.pseudo == null || req.body.pwd == null) {
		res.format({
			html: () => {
				res.render('connexion/connexion', {
					title: 'Connexion Page',
					warning: true
				})
			},
			json: () => {
				res.redirect({message: 'Error !'})
			}
		})
	}
	else {
		User.getByPseudo(req.body.pseudo).then((user) => {
			if (user == "") {
				res.format({
					html: () => {
						res.render('connexion/connexion', {
							title: 'Connexion Page',
							badConn: true
						})
					},
					json: () => {
						res.send({message: 'Error !'})
					}
				})
			}
			var comparepwd = bcrypt.compareSync(req.body.pwd, user[0]['pwd'])
			if (comparepwd) {
				require('crypto').randomBytes(48, function(err, buffer) {
  					var token = buffer.toString('hex')
  					Session.add(user[0]['rowid'], token).then((result) => {
  						res.format({
  							html: () => {
  								res.cookie('accessToken', token, {httpOnly: true })
  								res.redirect('/')
  							},
  							json: () => {
  								res.send({accessToken: token})
  							}
  						})
  					}).catch((err) => {
  						console.log(err)
  					})
				})
			} else {
				res.format({
					html: () => {
						res.render('connexion/connexion', {
							title: 'Connexion',
							badConn: true
						})
					},
					json: () => {
						res.send({message: 'Error !'})
					}
				})
			}
		}).catch((err) => {
			console.log(err)
		})
	}
})

// Déconnexion
router.delete('/', (req, res, next) => {
	res.format({
		html: () => {
			res.clearCookie('accessToken')
			res.redirect('/sessions')
		},
		json: () => {
			res.status(400)
			res.end()
		}
	})

})

router.all('*', (req, res) => {
	res.status(501)
	res.end("Error !")
})

module.exports = router
