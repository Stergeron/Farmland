var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 8989;

var server = app.listen(port);

var io = require('socket.io')(server);

var farms = {};

var Farm = function(pw, row, col) {
	this.gold = 100;
	this.farm = [];
	for (var i = 0; i < row; i++) {
		this.farm.push([]);
		for (var j = 0; j < col; j++) {
			this.farm[i].push({row: i, col: j, plant: {}});
		}
	}
	this.inventory = [];
	this.inventory.push({plant: new Plant(), quantity: 3});
	this.password = pw;
};

var Plant = function() {
	this.name = "carrot";
	this.age = 0;
	this.ripetime = 10;
	this.yield = 0;
	this.color = "#FF0000";
	this.shape = 0;
	this.hash = this.name+this.ripetime+this.yield+this.color+this.shape;
};

console.log("Farmland is running on port 8989");
/*
   var farm = new Farm();
   farms["William"] = farm;
   console.log(new Farm());
   plant("William", new Plant(), 3, 3);
   pick("William", 3, 3);
   grow()
   console.log(farms);*/

function plantFood(owner, tile, cb) {
	var inventory = farms[owner].inventory;
	var row = tile.row;
	var col = tile.col;
	var plant = farms[owner].farm[row][col].plant;
	if(plant.hash != undefined) {
		return false;
	}
	var found = false;
	inventory.forEach(function(item) {
		if(tile.plant.hash == item.plant.hash && item.quantity > 0) {
			item.quantity--;
			farms[owner].farm[row][col] = {row: row, col: col, plant: item.plant};
			found = true;
		}
	});
	return found;
}

function pickFood(owner, row, col) {
	var plant = farms[owner].farm[row][col].plant;
	var inventory = farms[owner].inventory;
	if (plant.hash != undefined && plant.age > plant.ripetime) {
		var found = false;
		inventory.forEach(function(item) {
			if(item.plant.hash == plant.hash) {
				console.log(item.plant);
				item.quantity++;
				farms[owner].farm[row][col] = {row: row, col: col, plant: {}};
				found = true;
			}
		});
		if(!found) {
			inventory.push({plant: plant, quantity: 3});
			plant = {row: row, col: col, plant: {}};
		}
		return true;
	}
	return false;
}

/*function growFood() {
	var keys = Object.keys(farms);
	keys.forEach(function(key) {
		if (farms[key]) {
			farms[key].farm.forEach(function(row) {
				row.forEach(function(plant) {
					if (plant.age !== undefined) {
						plant.age++;
					}
				});
			});
		}
	});
}*/


io.on('connection', function(socket) {
  var name = "";
  socket.on("createFarm", function(nm, pw, cb) {
    name = nm;
    if (farms[nm] === undefined) {
      var farm = new Farm(pw, 7, 7);
      farms[nm] = farm;
      cb(farm);
    } else if(farms[nm].password == pw) {
			cb(farms[nm]);
		} else {
      cb(false);
    }
		setInterval(growFood, 1000);
  });
  socket.on("plantFood", function(nm, tile, cb) {
    cb(plantFood(nm, tile));
  });
  socket.on("pickFood", function(nm, row, col, cb) {
    cb(pickFood(nm, row, col));
  });
	var growFood = function(){
		farms[name].farm.forEach(function(row){
			row.forEach(function(tile){
				if(tile.plant.age !== undefined){
					tile.plant.age++;
					socket.emit("update", farms[name]);
				}
			});
		});
	};
});
