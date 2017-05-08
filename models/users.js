const db = require('sqlite')
const bcrypt = require('bcryptjs')
const moment = require('moment')
const Session = require('../models/sessions')


function timeConverter(UNIX_timestamp){
	return moment(UNIX_timestamp).format("DD-MM-YYYY h:mm:ss")
}


module.exports = {


// getters
	getId: (accessToken) => {
		return Session.exists(accessToken).then((result) => {
			return result.userId
		})
	},

	getById: (id) => {
		return db.all('SELECT rowid, * FROM users WHERE rowid = ?',
			id)
	},

	getByPseudo: (pseudo) => {
		return db.all('SELECT rowid, * FROM users WHERE pseudo = ?',
			pseudo)
	},


}
