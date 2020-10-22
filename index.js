const express = require('express');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const path = require('path');
const winston = require('winston');
const bodyParser = require('body-parser');
const app = express();
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Static assets.
app.use(express.static(path.join(__dirname, 'public')));
// Logger.
app.use(morgan(':method :url :status :response-time ms', {
	stream: {
		write: message => logger.info(message.trim()),
	},
}));
const logger = winston.createLogger({
	transports: [new (winston.transports.Console)()],
});
// Bring in Mongo
const MongoClient = require('mongodb').MongoClient;

const connectionString = 'mongodb+srv://marcusbass323:2098Serra!@kink.tyhb6.mongodb.net/Kink?retryWrites=true&w=majority';

MongoClient.connect(connectionString, { 
	useUnifiedTopology: true, 
}).then(client => {
	const db = client.db('kink');
	const commentsCollection = db.collection('comments');
	  // Post a new comment to DB
	  app.post('/comments', (req, res) => {
		const db = client.db('kink');
		const commentsCollection = db.collection('comments');
		commentsCollection.insertOne(req.body)
			.then(()=> {
				res.redirect('/');
		  }).catch(error => res.send(error));
	  });
	  app.get('/comments', (req, res) => {
		// return comments
		commentsCollection.find().toArray((error, result) => {
			if (error) {
				throw error;
			} 
			res.json(result);
		});
	});
}).catch(error => console.error(error));

// Configure templating engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'njk');
nunjucks.configure(app.get('views'), {
	autoescape: true,
	express: app,
});

// Serve homepage
app.get('/', (request, response) => {
	const options = { pageTitle: 'Homepage' };
	return response.render('home', options);
});

// PORT
const PORT = 3000;

// Server connection
app.listen(PORT, () => {
	logger.log({ level: 'info', message: `listening on ${PORT}` });
});

