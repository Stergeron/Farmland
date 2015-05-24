var socket = io();

var game = new Vue({
	el: "html",
	data: {
		player: {},
		planting: -1,
		name: "bob",
		pw: "blop",
		showInv: false,
		showMarket: false,
		marketListings: [],
		landprice: 30
	},
	methods: {
		sell: function(item){
			socket.emit("sell", item);
		},
		buy: function(item){
			var _this = this;
			if(item == "land") socket.emit("buyland", function(price) {
				_this.landprice = price;
			});
			else socket.emit("buy", this.marketListings.indexOf(item));
		},
		market: function(item){
			socket.emit("market", item);
		},
		marketoggle: function() {
			this.showMarket = !this.showMarket;
			this.showInv = !this.showInv;
		},
		plantingMode: function(index) {
			this.planting = index;
		},
		toggleInventory: function(){
			if(this.showMarket) {
				this.showMarket = false;
				this.showInv = false;
			} else {
				this.showInv = !this.showInv;
			}
		},
		touch: function(tile) {
			if (tile.plant.age >= tile.plant.ripetime || this.planting == -1) {
				console.log("Picking");
				this.pick(tile);
			} else {
				console.log("Planting");
				this.plant(tile);
			}
		},
		plant: function(tile) {
			var _this = this;
			if(this.player.farm[tile.row][tile.col].plant !== undefined) {
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
			}
		},
		pick: function(tile) {
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
		},
		fillFarm: function(farm) {
			this.player = farm;
		},
		fillMarket: function(mark){
			this.marketListings = mark;
		}
	},
	filters: {
		debug: function(val) {
			console.log(val.name);
			return true;
		}
	}
});
var parser = document.createElement('a');
parser.href = window.location.href;
var creds = parser.hash.split("|");
creds[0] = creds[0].replace("#", "");

socket.emit("createFarm", creds[0], creds[1], function(farm) {
  game.name = creds[0];
  game.pw = creds[1];
  if (farm) {
    game.fillFarm(farm);
  } else {
    console.error("SOMEONE ELSE LOGGED IN DINGUS");
  }
});
socket.on("update", function(data) {
	game.fillFarm(data);
});
socket.on("market", function(data){
  game.fillMarket(data);
});
