var socket = io();

var game = new Vue({
  el: "body",
  data: {
    player: {},
    planting: "",
    name: "bob",
    pw: "blop",
    showInv: false,
    showMarket: false,
    marketListings: []
  },
  methods: {
    sell: function(item){
      socket.emit("sell", item);
    },
    buy: function(item){
      if(item == "land") socket.emit("buyland");
      else socket.emit("buy", this.marketListings.indexOf(item));
    },
    market: function(item){
      socket.emit("market", item);
    },
    marketoggle: function(){
      this.showMarket = !this.showMarket;
      this.showInv = !this.showInv;
    },
    plantingMode: function(seed) {
      this.planting = seed;
    },
    toggleInventory: function(){
      if(this.showMarket){
        this.showMarket = false;
        this.showInv = false;
      }
      else this.showInv = !this.showInv;
    },
    touch: function(tile) {
      console.log(tile);
      if (this.planting === "") {
        this.pick(tile);
      } else {
        this.plant(tile);
		this.planting = "";
      }
    },
    plant: function(tile) {
      if (this.planting !== "") {
        var _this = this;
        socket.emit("plantFood", this.name, { row: tile.row, col: tile.col, plant: this.planting.plant }, function(cb) {
          if (cb) {
            _this.player.farm[tile.row][tile.col].color = _this.planting.plant.color;
            _this.player.farm[tile.row][tile.col].name = _this.planting.plant.name;
            _this.player.farm[tile.row][tile.col].ripetime = _this.planting.plant.ripetime;
            _this.player.farm[tile.row][tile.col].hash = _this.planting.plant.hash;
            _this.player.farm[tile.row][tile.col].age = 0;
			_this.player.inventory.forEach(function(item) {
				if(item.plant == _this.planting.plant) {
					item.quantity--;
				}
			});
            if (_this.planting.quantity < 1) _this.planting = "";
          }
        });
      }
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
