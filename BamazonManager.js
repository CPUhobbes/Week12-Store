var db = require('mysql2-promise')();
var Table = require('cli-table');
var inquirer = require('inquirer');

db.configure({
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "Bamazon"
});

function checkNumber(number){

	if(number.match(/^(-?\d+)$/)){
		return true;
	}	
	else{
		return false;
	}
}

function validatePrice(number){
	if(number.match(/^(\d+?(\.\d{2}))$/)){
		return true;
	}	
	else{
		return false;
	}
}

function viewInventory(message, callback){
	return db.query('SELECT * FROM Products').spread(function (rows) {
		
		process.stdout.write('\033c');
		console.log(message);
		
		var table = new Table({
    		head: ['Item ID', 'Product Name', 'Quantity', 'Price'],
    		colWidths: [10,30,10,10]
		});

		rows.forEach(function(value, index){
			table.push([value.ItemID, value.ProductName, value.StockQuantity, value.Price]);
		});
		console.log(table.toString());
		return callback;
	}).then(function(callback){
		if(callback!==null){
			return callback();
		}
	})

	.catch(function(err){
		console.log(err);
	})

}



function addInventory(message){

	return viewInventory(message, null).then(function(){

		return inquirer.prompt([
		{
			type: "input",
			message: "What is the ID of the product inventory you want to change?",
			name: "id"
		},
		{
			type: "input",
			message: "How many do you want to add?",
			name: "quant"
		
		}]).then(function (result) {

			if(checkNumber(result.id) && checkNumber(result.quant)){

				return db.query('SELECT StockQuantity FROM Products WHERE ItemID = ?', result.id).spread(function (rows) {
					process.stdout.write('\033c');
					return [parseInt(rows[0].StockQuantity)+parseInt(result.quant), result.id];
				}).then(function(quantObj){
					return db.query('UPDATE products SET StockQuantity = ? WHERE ItemID = ?', quantObj).spread(function (rows) {
						console.log("Item Added!");
				})

				}).then(function(){
					return go();
				})
				.catch(function(err){
					console.log(err);
				});
			}

			else{
				return addInventory("Please enter a Number!\nAdd to Inventory");
			}
		
		});
	});

}

function lowInventory(){
	return db.query('SELECT * FROM Products WHERE StockQuantity < ?', ['5']).spread(function (rows) {
		
		process.stdout.write('\033c');
		console.log("Items with low inventory");
		
		var table = new Table({
    		head: ['Item ID', 'Product Name', 'Quantity', 'Price'],
    		colWidths: [10,30,10,10]
		});

		rows.forEach(function(value, index){
			table.push([value.ItemID, value.ProductName, value.StockQuantity, value.Price]);
		});
		console.log(table.toString());
	}).then(function(){
		
		return go();
	})

	.catch(function(err){
		console.log(err);
	})

}

function addItem(){

	return inquirer.prompt([
		{
			type: "input",
			message: "What is the name of the product you want to add?",
			name: "name"
		},
		{
			type: "input",
			message: "How many do you want to add?",
			name: "quant"
		
		},
		{
			type: "input",
			message: "What is the department?",
			name: "dept"
		
		},
		{
			type: "input",
			message: "What is the price?",
			name: "price"
		
		}]).then(function (result) {

			if(validatePrice(result.price)&&checkNumber(result.quant)){

				queryStr = "('"+result.name+"','"+result.dept+"','"+result.price+"','"+result.quant+"')";
				return db.query('INSERT INTO Products (ProductName, DepartmentName, Price, StockQuantity) VALUES '+queryStr).spread(function (rows) {
					console.log("Item Added!");
					return go();
				});

			}



	});
}


function go(){
	return inquirer.prompt([

	{
		type: "list",
		message: "Please select an option",
		choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
		name: "choice"
	}]).then(function (result) {
		switch(result.choice){

			case "View Products for Sale":
				return viewInventory("Products for sale", go);
				break;

			case "View Low Inventory":
				return lowInventory();
				break;

			case "Add to Inventory":
				return addInventory("Add to Inventory");
				break;

			case "Add New Product":
				return addItem();
				break;

			case "Exit":
				break;

		}
	});

}
process.stdout.write('\033c');
go().then(process.exit);