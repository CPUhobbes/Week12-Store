var db = require('mysql2-promise')();
var Table = require('cli-table');
var inquirer = require('inquirer');
var Promise = require("bluebird");

db.configure({
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "Bamazon"
});

//Checks for valid number
function checkNumber(number){

	if(number.match(/^(\d+)$/)){
		return true;
	}	
	else{
		return false;
	}
}

//Updates database and returns to main menu
function updateDatabase(name, overhead){
	return db.query('INSERT INTO departments (DepartmentName, OverheadCosts, TotalSales) VALUES (?,?,?)',
				[name, overhead, 0.00]
	).then(function(){
		console.log("Department Created!")
		return go();

	}).catch(function(err){
		console.log(err);
	});


}

//View all sales by department
function viewSales(){

	return db.query('SELECT *, TotalSales - OverheadCosts AS TotalProfit FROM Departments')
		.then (function(row) {
			process.stdout.write('\033c');
			var table = new Table({
	    		head: ['Dept ID', 'Department Name','Product Costs', 'Overhead Costs', 'Total Profit'],
	    		colWidths: [9,17, 15, 16, 14]
			});

			row[0].forEach(function(value, index){
		 		table.push([value.DepartmentID, value.DepartmentName, value.TotalSales, 
		 			value.OverHeadCosts, value.TotalProfit]);
			});
			//console.log(table);
			console.log(table.toString());
		}).then (function(){
			return go();

		}).catch(function(err){
		console.log(err);
	});

}

//Creates a new department
function createDepartment(){
	return inquirer.prompt([

	{
		type: "input",
		message: "What is the name of the new department?",
		name: "dept"
	},
	{
		type: "input",
		message: "What is the overhead cost of the new department?",
		name: "over"
	}]).then(function (result) {

		//Check if overhead is a number
		if(!checkNumber(result.over)){
			process.stdout.write('\033c');
			console.log("Please use a number!!");
			return createDepartment();
		}
		//Update database
		else{
			return updateDatabase(result.dept, result.over);	
		}
	}).catch(function(err){
		console.log(err);
	});

}

//Main menu
function go(){
	return inquirer.prompt([

	{
		type: "list",
		message: "Please select an option",
		choices: ["View Products Sales by Departments", "Create New Department", "Exit"],
		name: "choice"
	}]).then(function (result) {
		switch(result.choice){

			case "View Products Sales by Departments":
				process.stdout.write('\033c');
				return viewSales();
				break;

			case "Create New Department":
				process.stdout.write('\033c');
				return createDepartment();
				break;

			case "Exit":
				break;

		}
	});

}

//Run 
process.stdout.write('\033c');
go().then(process.exit);