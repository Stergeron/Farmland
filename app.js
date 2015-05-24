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
			this.farm[i].push({row:i, col:j});
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

function plant(owner, crop, row, col) {
	if (farms[owner].farm[row][col].hash === undefined) {
		plant.row = row;
		plant.col = col;
		farms[owner].farm[row][col] = crop;
		return true;
	}
	return false;
}

function pick(owner, row, col) {
	if (farms[owner].farm[row][col].hash != undefined && farms[owner].farm[row][col].age > farms[owner].farm[row][col].ripetime) {
		farms[owner].inventory.push(farms[owner].farm[row][col]);
		farms[owner].farm[row][col] = {row: row, col: col};
		return true;
	}
	return false;
}

function grow() {
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
}

setInterval(grow, 1000);

io.on('connection', function(socket) {
  var name = "";
  socket.on("createFarm", function(nm, ps, cb) {
    name = nm;
    if (farms[nm] === undefined || farms[nm].password == ps) {
      var farm = new Farm(ps, 7, 7);
      farms[nm] = farm;
      cb(farm);
    } else {
      cb(false);
    }
  });
  socket.on("plant", function(nm, crop, row, col, cb) {
    cb(plant(nm, crop, row, col));
  });
  socket.on("pick", function(nm, row, col, cb) {
    cb(pick(nm, row, col));
  });
});
