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
 



function exit(){
	return inquirer.prompt([

	{
		type: "input",
		message: "Would you like to start shopping? (Y/N)",
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
	})

}

function total(){

	//return function(){
		//items.forEach(function(value, index){

			return updateTable(items.length-1);
		// return db.query('SELECT StockQuantity FROM products WHERE ProductName = \'Computer\'').spread(function (rows) {
		// 		console.log("test");
		// 		console.log(rows);
				//db.query('UPDATE products SET StockQuantity WHERE ProductName ='+va)



			//});
	//}


		//});
	//}

	// var queryStr ="UPDATE products SET ";
	// items.forEach(function(value, index){
	// 	queryStr+=()
		
	// });

	
	// var table = new Table({
 //    		head: ['Product', 'Quantity','Price'],
 //    		colWidths: [30,10, 10]
	// 	});

	// 	items.forEach(function(value, index){
	// 	 	table.push([value, itemQuant[index], itemCost[index]]);
	// 	});
	// 	var total = 0;
	// 	itemCost.forEach(function(value, index){
	// 		total+=(parseFloat(value)*parseFloat(itemQuant[index]));
	// 	});
	// 	console.log(total);
	// 	table.push(["---------------------------", "", ""]);
	// 	table.push(["TOTAL ", "", total]);


	// 	console.log(table.toString());
	// 	console.log("Thanks for shopping!")

}

function updateTable(counter){
	return db.query('SELECT StockQuantity FROM products WHERE ProductName ='+"\""+items[counter]+"\"").then(function(rows) {
				//console.log("test");
				//console.log(rows[0]);
				//var temp = parseFloat(rows[0] - itemQuant[counter]);
				var temper= rows[0][0].StockQuantity;
				console.log(temper, itemQuant[counter])
				return db.query('UPDATE products SET StockQuantity = 13 WHERE ProductName ='+"\""+items[counter]+"\"").then(function (morerows){


					if(counter>0){
						return updateTable(counter-1);
					}

				});


				
			});
}


function checkout(){
	return inquirer.prompt([

	// Here we create a basic text prompt.
	{
		type: "input",
		message: "Would you like to checkout? (Y/N)",
		name: "checkout"
	}]).then(function (result) {
		if(result.checkout.toUpperCase() === 'Y'){
			return total();
		}
		else if(result.checkout.toUpperCase() === 'N'){
			return printMenu();
		}
		else{
			return checkout();
		}
		

	}).then(function(){

	});

}

function getQuery(id, amount){
	//console.log(id, amount);
	return db.query('SELECT ProductName, Price, StockQuantity FROM products WHERE ItemID ='+id).spread(function (rows) {
		
		if(rows.length<1){
			console.log("I'm sorry that Item ID does not exist in our inventory");
		}
		else{
			if(rows[0].StockQuantity === 0){
				console.log("Sorry there are not any items avaliable!");
				return printMenu();
			}
			else if(rows[0].StockQuantity<amount){
				console.log("Sorry there are not enough items avaliable!");
				return printMenu();
			}
			else{
				items.push(rows[0].ProductName);
				itemCost.push(rows[0].Price);
				itemQuant.push(amount);
				return checkout();
			}
		}


	}).then(function(){
		//console.log("cool");
	});
}


function orderItem(){

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

		return getQuery(result.id, result.quant);
	})
}

function printMenu(){
	return db.query('SELECT * FROM products').spread(function (rows) {
		
		var table = new Table({
    		head: ['Item ID', 'Product Name', 'Price'],
    		colWidths: [10,30,10]
		});

		rows.forEach(function(value, index){
			table.push([value.ItemID, value.ProductName, value.Price]);
		});
		console.log(table.toString());
		
	}).then(function(){
		return exit();
	})

	.catch(function(err){
		console.log(err);
	})

}

function run(){
	process.stdout.write('\033c');
	console.log("Welcome to the Store!")
	printMenu().then(process.exit);

}

run();



