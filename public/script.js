var socket = io();

var game = new Vue({
  el: "#ui",
  data: {
    player: {},
    planting: "",
    name: "bob",
    pw: "blop"
  },
  methods: {
    plantingMode: function(seed) {
      this.planting = seed;
    },
    touch: function(tile) {
      if (this.planting === "") {
        this.pick(tile);
      } else {
        this.plant(tile);
      }
    },
    plant: function(tile) {
      if (this.planting !== "") {
        var _this = this;
        socket.emit("plantFood", this.name, this.planting.plant, tile.row, tile.col, function(cb) {
          if (cb) {
            _this.player.farm[tile.row][tile.col].color = _this.planting.plant.color;
            _this.player.farm[tile.row][tile.col].name = _this.planting.plant.name;
            _this.player.farm[tile.row][tile.col].ripetime = _this.planting.plant.ripetime;
            _this.player.farm[tile.row][tile.col].hash = _this.planting.plant.hash;
            _this.player.farm[tile.row][tile.col].age = _this.planting.plant.age;
            location.reload();
            _this.player.inventory[_this.player.inventory.indexOf(_this.planting)].quantity--;
            if (_this.planting.quantity < 1) _this.planting = "";
          }
        });
      }
    },
    pick: function(tile) {
      if (tile.age >= tile.ripetime) {
        var _this = this;
        socket.emit("pickFood", this.name, tile.row, tile.col, function(cb) {
          if (cb) {
            _this.player.inventory.forEach(function(item) {
              if (item.plant.hash == tile.hash) {
                _this.player.farm[tile.row][tile.col].color = undefined;
                _this.player.farm[tile.row][tile.col].name = undefined;
                _this.player.farm[tile.row][tile.col].ripetime = undefined;
                _this.player.farm[tile.row][tile.col].age = undefined;
                item.quantity++;
                location.reload();
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
