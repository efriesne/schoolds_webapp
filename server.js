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

app.get('/school_chars.json', getCharacteristics);

app.get('/mapData.json', getMapData);

function getMapData(request, response){

	var query = "SELECT * FROM basic \
					INNER JOIN success \
					ON basic.school_id = success.school_id\
					AND basic.year = success.year\
					INNER JOIN enrollments\
					ON basic.school_id = enrollments.school_id\
					AND basic.year = enrollments.year\
					INNER JOIN neighbors\
					ON basic.school_id = neighbors.school_id\
					AND basic.year = neighbors.year;"

	conn.query(query, function(error, result) {
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


		var options = {
		  mode: 'text',
		  pythonPath: '/usr/local/bin/python3',
		  pythonOptions: ['-u'],
		  scriptPath: 'public/ml',
		  args: []
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

function getCharacteristics(request, response) {

	var n = request.query;
	console.log(n);

	var query = "SELECT * FROM basic b INNER JOIN racegender r ON b.school_id=r.school_id \
				 INNER JOIN teachers t ON b.school_id = t.school_id INNER JOIN selectedpopulation s \
				 ON b.school_id = s.school_id \
				 WHERE b.school_id = $1 AND b.year = $2 AND r.year = $3 and \
				 s.year = $4 and t.year = $5;;"

	conn.query(query, [n.id, n.y, n.y, n.y, n.y], function(error, result) {

		if (error){
			console.log(error);
		}
		else{
			console.log(result.rows);
			response.json(result.rows);
		}
	})
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




