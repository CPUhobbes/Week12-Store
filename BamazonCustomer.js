//Node modules
var db = require('mysql2-promise')();
var Table = require('cli-table');
var inquirer = require('inquirer');
var Promise = require("bluebird");

//Database Connect
db.configure({
    "host": "localhost",
    "user": "root",
    "password": "123456",
    "database": "Bamazon"
});

//Object for each item in "shopping cart"
var itemObj = function(id, name, dept, price, quantity){
	this.id = id;
	this.name = name;
	this.dept = dept;
	this.price = price;
	this.quantity = quantity;
}

//Array of all itemObj in "shopping cart"
var transactionList =[];

//Check for valid number
function checkNumber(number){

	if(number.match(/^(\d+)$/)){
		return true;
	}	
	else{
		return false;
	}
}

//Print receipt in table format
function printReceipt(){
	process.stdout.write('\033c');
	var receiptTotal = 0;
	var table = new Table({
    		head: ['Product', 'Quantity','Price'],
    		colWidths: [30,10, 10]
		});
	//Loop through transaction list and add to table
	transactionList.forEach(function(value, index){
	 	table.push([value.name, value.quantity, value.price.toFixed(2)]);
	 	receiptTotal+=(value.quantity*value.price); //Gets total from each item
	});

	table.push(["---------------------------", "", "-----"]);
	table.push(["TOTAL ", "", receiptTotal.toFixed(2)]);

	console.log(table.toString());
	console.log("Thanks for shopping!");

}

//Update inventory in databases (products and departments)
function updateInventory(){

	return Promise.map(transactionList, function(item) {
		//Get query results from database
		return db.query('select products.ProductName, products.StockQuantity, products.DepartmentName, departments.TotalSales From products '+
			'inner join departments ON products.DepartmentName=departments.DepartmentName AND ?', 
			[{'products.ItemID': item.id}])
		 .then (function(quantityRow) {

		 	//Calculate remaining stock and total sales
		 	var stock = parseInt(quantityRow[0][0].StockQuantity)- item.quantity;
		 	var sales = parseFloat(quantityRow[0][0].TotalSales) + (item.price * item.quantity);

		 	//update query to database
		 	return db.query('UPDATE Products, Departments SET ? , ? WHERE ? AND ?',
		 		[{'products.StockQuantity':stock},{'departments.TotalSales':sales},{'products.ItemID':item.id},
		 			{'departments.DepartmentName':item.dept}])
		})
	})
	.then(function (){
		printReceipt();  //Print receipt
	}).catch(function(err){
		console.log(err);
	});
}

//Prompts to see if user would like to check out
function checkout(){
	return inquirer.prompt([
	{
		type: "input",
		message: "Would you like to checkout? (Y/N)",
		name: "checkout"
	}]).then(function (result) {
		if(result.checkout.toUpperCase() === 'Y'){
			return updateInventory();
		}
		else if(result.checkout.toUpperCase() === 'N'){
			return printMenu("");
		}
		else{
			return checkout();
		}
	}).catch(function(err){
		console.log(err);
	});

}

//Function gets query based on selection by user
function getQuery(id, amount){

	//Get name, price, and quantity from database
	return db.query('SELECT ProductName, DepartmentName, Price, StockQuantity FROM Products WHERE ?', [{ItemID: id}])
	.spread(function (rows) {
		
		//validate quantity and item
		if(rows.length<1){
			return printMenu("I'm sorry that Item ID does not exist in our inventory");
		}
		else{
			if(parseInt(rows[0].StockQuantity) === 0){
				return printMenu("Sorry there are not any items avaliable!");
			}
			else if(parseInt(rows[0].StockQuantity)<amount){
				return printMenu("Sorry there are not enough items avaliable!");
			}
			else{

				//Create new item object and add it to "shopping list" array
				var tempItem = new itemObj(id, rows[0].ProductName, rows[0].DepartmentName, parseFloat(rows[0].Price), parseInt(amount));
				transactionList.push(tempItem);
				return checkout();

			}
		}
	}).catch(function(err){
		console.log(err);
	});
}

//Prompts user on item to purchase
function orderItem(){

	return inquirer.prompt([
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

		if(checkNumber(result.id) && checkNumber(result.quant)){
			return getQuery(result.id, result.quant);
		}
		else{
			console.log("Please enter a Number!")
			return orderItem();
		}
	}).catch(function(err){
		console.log(err);
	});
}

//Prompts user if they would like to exit
function exit(){
	return inquirer.prompt([
	{
		type: "input",
		message: "Would you like purchase an item? (Y/N)",
		name: "checkout"
	}]).then(function (result) {
		if(result.checkout.toUpperCase() === 'Y'){
			return orderItem();
		}
		else if(result.checkout.toUpperCase() === 'N'){
			console.log("Thanks for stopping by... Come again!");
		}
		else{
			return exit();
		}
	}).catch(function(err){
		console.log(err);
	});
}

//Displays all items in database
function printMenu(message){
	return db.query('SELECT * FROM Products').spread(function (rows) {
		
		process.stdout.write('\033c');
		console.log("Welcome to the Store!");
		
		var table = new Table({
    		head: ['Item ID', 'Product Name', 'Price'],
    		colWidths: [10,30,10]
		});

		rows.forEach(function(value, index){
			table.push([value.ItemID, value.ProductName, value.Price]);
		});
		console.log(table.toString());
		if(message!==""){
			console.log(message);
		}
		
	}).then(function(){
		return exit();
	})
	.catch(function(err){
		console.log(err);
	});

}

//run program
function run(){	
	printMenu("").then(process.exit);
}

run();
