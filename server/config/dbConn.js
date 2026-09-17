const mongoose = require('mongoose')

const connectDB = async () => {
	const dbUri = process.env.DATABASE_URI || 'mongodb://localhost:27017/ichurit'

	try {
		await mongoose.connect(dbUri)
	} catch (error) {
		console.log('error_db:' + error)
	}
}

module.exports = connectDB
