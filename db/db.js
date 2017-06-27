const config = require('config.json')('./config.json');

const MongoClient = require('mongodb').MongoClient,
			ObjectId = require('mongodb').ObjectID,
			/*MongoStore = require('connect-mongo')(session),*/
			mongoose = require('mongoose');
			
mongoose.connect(config.mongodb.url);