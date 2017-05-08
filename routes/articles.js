// Constantes
const router = require('express').Router()
const Type = require('type-of-is')
const Session = require('../models/sessions')
const User = require('../models/users')
const Article = require('../models/articles')

// Render Articles
function renderArticles(res, articles) {
	var title = 'Mon Blog'
	var hasArticles = true
	var affichage = false
	if (articles.length == 0) hasArticles = false
	var list = []
	for (var i = articles.length - 1; i >= 0; i--) {
		list.push(articles[i])
	}
	res.format({
		html: () => {
			res.render('articles/showAll', {
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

// Tous les articles
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

// Add article
router.get('/add', (req, res, next) => {
	var token = Session.getToken(req)
	var warning = false
	var hasArticles = false
	if(req.query.warning) warning = true
	User.getId(token).then((userId) => {
		User.getById(userId).then((user) => {
			res.format({
				html: () => {
					res.render('articles/edit', {
						title: 'Add Articles',
						action: '/articles/add',
						warning: warning
					})
				},
				json: () => {
					res.status(400)
					res.end()
				}
			})
		})
	})
})

// Add article
router.post('/add', (req, res, next) => {
	var token = Session.getToken(req)
	var titre = req.body.titre
	var corps = req.body.corps
	if (!titre) {
		res.redirect('/articles/add?warning=true')
	} else {
		if (!corps) corps = null
		User.getId(token).then((userId) => {
			User.getById(userId).then((user) => {
				Article.insert(userId, user[0]['pseudo'], titre, corps).then((result) => {
					res.redirect('/articles')
				})
			})
		})
	}
})

// Show Article by id
router.get('/:articlesId', (req, res) => {
		Article.getByArticlesId(req.params.articlesId).then((articles) => {
			var name = articles[0].articlesId
			var notThisOne = true
			Article.AddCompteur(name).then((result) => {
				res.format({
					html: () => {
						res.render('articles/show', {
							title: 'Articles : '+req.params.articlesId,
							articles: articles,
							suppr: '/articles/'+req.params.articlesId+'?_method=DELETE',
							modif: '/articles/'+req.params.articlesId+'/edit',
							notThisOne: notThisOne
						})
					},
					json: () => {
						res.send(articles)
					}
				})
			}).catch((err) => {
				console.log(err)
			})
		})
})

router.get('/:articlesId/edit', (req, res) => {
	Article.getByArticlesId(req.params.articlesId).then((articles) => {
		res.format({
			html: () => {
				res.render('articles/edit', {
					title: 'Update article '+ req.params.articlesId,
					articles: articles,
					action: '/articles/' + req.params.articlesId + '?_method=PUT'
				})
			},
			json: () => {
				res.status(400)
				res.end()
			}
		})
	}).catch((err) => {
		res.status(404)
		res.end('Article not found')
	})
})

// Update Article
router.put('/:articlesId', (req, res) => {
				var titre = req.body.titre
				var corps = req.body.corps
				Article.updateArticle(req.params.articlesId, titre, corps).then((result) => {
					res.format({
						html: () => {
							res.redirect('/articles')
						},
						json: () => {
							res.send({message: 'Success'})
						}
					})
				}).catch((err) => {
					res.status(404)
					res.end('ERR4 > '+err)
				})
})

// Delete Article
router.delete('/:articlesId', (req, res) => {
				Article.deleteArticle(req.params.articlesId).then((result) => {
					res.format({
						html: () => {
							res.redirect('/articles')
						},
						json: () => {
							res.send({message: 'Success'})
						}
					})
				}).catch((err) => {
					res.status(404)
					res.end('ERR4 > '+err)
				})
})

router.all('*', (req, res) => {
	res.status(501)
	res.end("Error !")
})

module.exports = router
