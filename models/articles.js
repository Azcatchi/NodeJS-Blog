const mongoose = require('mongoose')
const moment = require('moment')
const Redis = require('ioredis')
const compteur = new Redis()

// Déclaration du schéma de team
var shemaarticle = new mongoose.Schema({
  articlesId: String,
  userId: String,
  auteur: String,
  titre: String,
  corps: String,
  createdAt: String,
  updatedAt: String
})

function dateFormated() {
	var now = moment(new Date())
	var date = now.format("D MMM YYYY")
	var time = now.format("HH:mm")
	return (date +" at "+ time)
}

// Model
var articlesModel = mongoose.model('articles', shemaarticle);

module.exports = {

// Fonctions principales
	insert: (userId, auteur, titre, corps) => {
		var newArticles = new articlesModel({
			articlesId: require('uuid').v4(),
			userId: userId,
			auteur: auteur,
      titre: titre,
			corps: corps,
			createdAt: dateFormated(),
			updatedAt: null
		})
		return newArticles.save()
	},

  updateArticle: (articlesId, titre, corps) => {
		return articlesModel.update({articlesId: articlesId}, {$set: {titre: titre, corps: corps, updatedAt: dateFormated()}},{upsert:true})
	},
	deleteArticle: (articlesId) => {
		var ArticlesToDelete = articlesModel.find(null)
    ArticlesToDelete.where('articlesId', articlesId)
		return ArticlesToDelete.remove()
	},

// Getters
	getbyUserId: (userId) => {
		var findArticles = articlesModel.find(null)
		return findArticles.exec()
	},

	getByArticlesId: (userId) => {
		var findArticles = articlesModel.find(null)
		findArticles.where('articlesId', userId)
		return findArticles.exec()
	},

// Redis vus
  AddCompteur: (articlesId) =>{
    return compteur.hget('Article:'+ articlesId, 'Vus').then((test) => {
		    var nbrVus = parseInt(test);
		    nbrVus += 1;
			  return compteur.hmset('Article:'+ articlesId, 'Vus', nbrVus)
		})
	},

	findCompteur: (articlesId) => {
		return compteur.hget('Article:'+ articlesId, 'Vus')
	}


}
