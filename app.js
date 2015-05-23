var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 8989;

var server = app.listen(port);

var io = require('socket.io')(server);

var farms = {};

var Farm = function() {
	this.gold = 100;
	this.farm = [];
	for(var i = 0; i < 10; i++) {
		this.farm.push([]);
		for(var j = 0; j < 10; j++) {
			this.farm[i].push({});
		}
	}
	this.inventory = [];
};

var Plant = function() {
	this.age = 0;
	this.ripetime = 10;
	this.yield = 0;
	this.color = "#FF0000";
	this.shape = 0;
}

console.log("Farmland is running on port 8989");
/*
var farm = new Farm();
farms["William"] = farm;
console.log(new Farm());
plant("William", new Plant(), 3, 3);
pick("William", 3, 3);
grow()
console.log(farms);*/

function plant(owner, plant, row, col) {
	if(farms[owner].farm[row][col] != {}) {
		farms[owner].farm[row][col] = plant;
		return true;
	}
	return false;
}

function pick(owner, row, col) {
	if(farms[owner].farm[row][col] != {} && farms[owner].farm[row][col].age > farms[owner].farm[row][col].ripetime) {
		farms[owner].inventory.push(farms[owner].farm[row][col]);
		farms[owner].farm[row][col] = {};
		return true;
	}
	return false;
}

function grow() {
	var keys = Object.keys(farms);
	keys.forEach(function (key) {
		farms[key].farm.forEach(function (row) {
			row.forEach(function(plant) {
				if(plant.age !== undefined) {
					plant.age++;
				}
			});
		});
	});
}

setInterval(grow, 1000);

io.on('connection', function(socket) {
		socket.on("createFarm", function(nm, cb) {
			if(farms[nm] === undefined) {
				farms[nm] = new Farm();
				cb(true);
			} else {
				cb(false);
			}
		});
		socket.on("plant", function(nm, row, col, cb) {
			cb(plant(nm, row, col));
		});
		socket.on("pick", function(nm, row, col, cb) {
			cb(pick(nm, row, col));
		});
});
