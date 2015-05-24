var socket = io();

var game = new Vue({
	el: "body",
	data: {
		player: {},
		planting: -1,
		name: "bob",
		pw: "blop",
		showInv: false
	},
	methods: {
		sell: function(item){
			socket.emit("sell", item);
		},
		market: function(item){

		},
		plantingMode: function(index) {
			this.planting = index;
		},
		toggleInventory: function(){
			this.showInv = !this.showInv;
		},
		touch: function(tile) {
			if (this.planting == -1) {
				console.log("Picking");
				this.pick(tile);
			} else {
				console.log("Planting");
				this.plant(tile);
			}
		},
		plant: function(tile) {
			var _this = this;
			socket.emit("plantFood", this.name, { row: tile.row, col: tile.col, plant: this.player.inventory[this.planting].plant }, function(cb) {
				if (cb) {
					_this.player.farm[tile.row][tile.col].plant.color = _this.player.inventory[_this.planting].plant.color;
					_this.player.farm[tile.row][tile.col].plant.name = _this.player.inventory[_this.planting].plant.name;
					_this.player.farm[tile.row][tile.col].plant.ripetime = _this.player.inventory[_this.planting].plant.ripetime;
					_this.player.farm[tile.row][tile.col].plant.hash = _this.player.inventory[_this.planting].plant.hash;
					_this.player.farm[tile.row][tile.col].plant.age = 0;
					_this.player.inventory.forEach(function(item) {
						if(item.plant == _this.player.inventory[_this.planting].plant) {
							item.quantity--;
						}
					});
					if (_this.player.inventory[_this.planting].quantity < 1) _this.planting = -1;
				}
			});
		},
		pick: function(tile) {
			if (tile.plant.age >= tile.plant.ripetime) {
				var _this = this;
				socket.emit("pickFood", this.name, tile.row, tile.col, function(cb) {
					if (cb) {
						_this.player.inventory.forEach(function(item) {
							if (item.plant.hash == tile.plant.hash) {
								_this.player.farm[tile.row][tile.col].plant.color = undefined;
								_this.player.farm[tile.row][tile.col].plant.name = undefined;
								_this.player.farm[tile.row][tile.col].plant.ripetime = undefined;
								_this.player.farm[tile.row][tile.col].plant.age = undefined;
								item.quantity++;
							}
						});
					}
				});
			}
		},
		fillFarm: function(farm) {
			this.player = farm;
		}
	},
	filters: {
		debug: function(val) {
			console.log(val.name);
			return true;
		}
	}
});

socket.emit("createFarm", game.name, game.pw, function(farm) {
	if (farm) {
		game.fillFarm(farm);
	} else {
		console.error("SOMEONE ELSE LOGGED IN DINGUS");
	}
});
socket.on("update", function(data) {
	game.fillFarm(data);
});
