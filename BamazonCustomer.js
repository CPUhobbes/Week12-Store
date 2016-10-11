var db = require('mysql2-promise')();
var Table = require('cli-table');
var inquirer = require('inquirer');
db.configure({
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "Bamazon"
});
 



var table = new Table({
    head: ['TH 1 label', 'table2']
  , colWidths: [30, 30]
});




function askQuestion(){

	return inquirer.prompt([

	// Here we create a basic text prompt.
	{
		type: "input",
		message: "What is the ID of the product you want?",
		name: "id"
	},
	{
		type: "input",
		message: "How many do you want?",
		name: "quant"
	
	}]).then(function (result) {
		console.log(result.id, result.quant);
		

	});

}

function connectToDB(query){
	return db.query(query).spread(function (rows) {
		
		rows.forEach(function(value, index){
		 table.push([value.ProductName, value.Price]);
		});

	}).then(function(){

		console.log(table.toString());
		//console.log('test');
	}).then(function(){

		return askQuestion();
	})





	.catch(function(err){
		console.log(err);
	})

}




connectToDB('SELECT * FROM Products').then(process.exit);

