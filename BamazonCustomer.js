var db = require('mysql2-promise')();
var Table = require('cli-table');
var inquirer = require('inquirer');

// var table;

var items =[];
var itemCost= [];
var itemQuant =[];

db.configure({
    "host": "localhost",
    "user": "root",
    "password": "123456",
    "database": "bamazon"
});
 

function checkNumber(number){

	if(number.match(/\d+/)){
		return true;
	}	
	else{
		return false;
	}
}

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
	});

}

function printReceipt(){
	process.stdout.write('\033c');
	var table = new Table({
    		head: ['Product', 'Quantity','Price'],
    		colWidths: [30,10, 10]
		});

	items.forEach(function(value, index){
	 	table.push([value, itemQuant[index], itemCost[index]]);
	});
	var total = 0;
	itemCost.forEach(function(value, index){
		total+=(parseFloat(value)*parseFloat(itemQuant[index]));
	});
	table.push(["---------------------------", "", "-----"]);
	table.push(["TOTAL ", "", total.toFixed(2)]);


	console.log(table.toString());
	console.log("Thanks for shopping!");

}

function updateTable(counter){
	return db.query('SELECT StockQuantity FROM products WHERE ProductName ='+"\""+items[counter]+"\"")
	.then(function(rows) {
		var temp = rows[0][0].StockQuantity - itemQuant[counter];
		return db.query('UPDATE products SET StockQuantity = '+temp+' WHERE ProductName ='+"\""+items[counter]+"\"")
			.then(function (morerows){
				if(counter>0){
					return updateTable(counter-1);
				}
				else{
					printReceipt();
				}
			});
			
		});
}

function checkout(){
	return inquirer.prompt([
	{
		type: "input",
		message: "Would you like to checkout? (Y/N)",
		name: "checkout"
	}]).then(function (result) {
		if(result.checkout.toUpperCase() === 'Y'){
			return updateTable(items.length-1);
		}
		else if(result.checkout.toUpperCase() === 'N'){
			return printMenu("");
		}
		else{
			return checkout();
		}
	});

}

function getQuery(id, amount){
	return db.query('SELECT ProductName, Price, StockQuantity FROM products WHERE ItemID ='+id).spread(function (rows) {
		
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
				items.push(rows[0].ProductName);
				itemCost.push(rows[0].Price);
				itemQuant.push(amount);
				return checkout();
			}
		}
	});
}


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
	})
}

function printMenu(message){
	return db.query('SELECT * FROM products').spread(function (rows) {
		
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
	})

}

function run(){	
	printMenu("").then(process.exit);

}

run();