const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('./models/User')
const Class = require('./models/Class')

require('dotenv').config()

async function seed() {
	try {
		const dbUri = process.env.DATABASE_URI || 'mongodb://localhost:27017/ichurit'
		await mongoose.connect(dbUri)

		const adminUsername = 'admin'
		const adminPassword = 'admin123'

		const existingUser = await User.findOne({ username: adminUsername })
		let userId
		if (!existingUser) {
			const hashedPassword = await bcrypt.hash(adminPassword, 10)
			const user = await User.create({
				username: adminUsername,
				password: hashedPassword,
				role: 'admin'
			})
			userId = user._id
            console.log("create new user with id", userId)
		} else userId = existingUser._id
		const c = await Class.create({ grade: 'א', number: '1', email: 'a1@gmail.com', teacher: 'mr. cohen', user: userId })
        console.log("create class", c._id)
	} catch (error) {
		console.warn('error in seed:', error)
		process.exit(1)
	} finally {
		await mongoose.disconnect()
	}
}

seed()
