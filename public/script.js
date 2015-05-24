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
    plant: function(tile) {
      if (this.planting !== "") {
        var _this = this;
        socket.emit("plantFood", this.name, this.planting.plant, tile.row, tile.col, function(cb) {
          if (cb) {
            _this.player.farm[tile.row][tile.col] = _this.planting.plant;
            _this.player.inventory[_this.player.inventory.indexOf(_this.planting)].quantity--;
          }
        });
      }
    },
    fillFarm: function(farm) {
      this.player = farm;
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
