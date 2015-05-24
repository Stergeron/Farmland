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
            _this.player.farm[tile.row][tile.col].color = _this.planting.plant.color;
            _this.player.farm[tile.row][tile.col].name = _this.planting.plant.name;
            _this.player.farm[tile.row][tile.col].ripetime = _this.planting.plant.ripetime;
            _this.player.farm[tile.row][tile.col].age = _this.planting.plant.age;
            location.reload();
            _this.player.inventory[_this.player.inventory.indexOf(_this.planting)].quantity--;
            if (_this.planting.quantity < 1) _this.planting = "";
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
