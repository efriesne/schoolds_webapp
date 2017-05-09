var express = require('express')
var bodyParser = require('body-parser');
var anyDB = require('any-db');
var engines = require('consolidate');
var path = require('path');
var PythonShell = require('python-shell');
var app = express();

app.engine('html', engines.hogan); 
app.set('views', __dirname + '/views');
app.set('view engine', 'html'); 

//CSS and JS files
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

var conn = anyDB.createConnection('sqlite3://schools_data.db');

//Request for home page
app.get('/', function(request, response) {
	console.log('Homepage requested');
	response.render('index.html');
});

app.get('/page1.html', function(request, response){
	console.log('page1 requested');
	response.render('page1.html');
});

app.get('/page2.html', function(request, response){
	console.log('page2 requested');
	response.render('page2.html');
});

app.get('/neighbors.json', nearestNeighbors);

app.get('/neighbors_info.json', neighborsInfo);

app.get('/success', successPrediction);

function nearestNeighbors(request, response) {
  	console.log(request);
  	var school_id = request.query.id;
  	var year = request.query.y;
  	console.log(school_id);
  	console.log(year);

	var query = "SELECT * FROM neighbors WHERE school_id=$1 and year=$2";

	conn.query(query, [school_id, year], function(error, result) {
		if (error != null){
			console.log(error);
		}
		else{
			var n = result.rows;
			console.log(n);
			response.json(n);
		}
	});
}

function neighborsInfo(request, response) {

	var n = request.query;
	console.log(n);

	var query = "SELECT DISTINCT b.school_id, b.school, b.town, s.success, s.year \
					FROM success s LEFT JOIN basic b \
					ON s.school_id = b.school_id \
					WHERE s.year = $1 AND (s.school_id = $2 OR s.school_id = $3 OR s.school_id = $4 OR s.school_id = $5 \
					OR s.school_id = $6 OR s.school_id = $7 OR s.school_id = $8 \
					OR s.school_id = $9 OR s.school_id = $10 OR s.school_id = $11 \
					OR s.school_id = $12) \
					ORDER BY s.success asc;"

	conn.query(query, [n.year, n.school_id, n.n1, n.n2, n.n3, n.n4, n.n5, n.n6, n.n7, n.n8, n.n9, n.n10, n.n11], function(error, result) {
		
		if (error != null){
			console.log(error);
		}
		else {
			console.log(result.rows);
			response.json(result.rows);
		}
	})
}

function successPrediction(request, response) {
	var n = request.query
	var fields = n.fields;
	var values = n.values;
	console.log(fields.concat(values));

	var options = {
	  	mode: 'text',
	  	pythonPath: '/usr/local/bin/python3',
	  	pythonOptions: ['-u'],
	  	scriptPath: 'public/ml',
	  	args: fields.concat(values)
	};

	PythonShell.run('edit_feat.py', options, function (err, results) {
	  	if (err) throw err;

		args = ['-test', 'public/ml/test.csv']

		var options = {
		  mode: 'text',
		  pythonPath: '/usr/local/bin/python3',
		  pythonOptions: ['-u'],
		  scriptPath: 'public/ml',
		  args: args
		};

	  	PythonShell.run('predict_success.py', options, function (err, results) {
		  if (err) throw err;
		  // results is an array consisting of messages collected during execution
		  label = parseFloat(results[0])
		  response.json(label);
		  console.log('results: %j', results[0]);
	  
		});
	});
}

//Start listening on port
app.listen(8080, function(error, response) {
	if (error != null){
		console.log("Error: " + error);
	}
	else {
		console.log('listening on port: 8080');
	}
});




