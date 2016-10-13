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



function viewSales(){

	return db.query('SELECT *, ProductSales - OverheadCosts AS TotalProfit FROM Departments')
		.then (function(row) {
			process.stdout.write('\033c');
			var table = new Table({
	    		head: ['Dept ID', 'Department Name','Product Costs', 'Overhead Costs', 'Total Profit'],
	    		colWidths: [10,30, 10, 10, 10]
			});

			row[0].forEach(function(value, index){
		 		table.push([value.DepartmentID, value.DepartmentName, value.ProductSales, 
		 			value.OverHeadCosts, value.TotalProfit]);
			});
			//console.log(row[0]);
			console.log(table.toString());
		}).then (function(){
			return go();



		});

}

function createDepartment(){


}




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
				return viewSales();
				break;

			case "Create New Department":
				return createDepartment();
				break;

			case "Exit":
				break;

		}
	});

}
go().then(process.exit);




			//SELECT *, ProductSales - OverheadCosts AS TotalProfit FROM Departments;