var socket = io();

var game = new Vue({
  el: "#ui",
  data: {
    farm: [

    ],
    inventory: [
      {name: "seed"},{name: "poop"}
    ],
    money: 100,
    spectating: false
  },
  methods: {
    populateFarm: function() { //TEST UNTIL SERVER WERKS
      for (var y = 0; y < 10; y++) {
        this.farm.push([]);
        for (var x = 0; x < 10; x++) {
          this.farm[y].push([]);
          this.farm[y][x] = {};
        }
      }
    },
    fillFarm: function(farm){
      this.$data = farm;
    }
  }
});

socket.emit("createFarm", "bob", function(farm){
  if(farm){
    game.fillFarm(farm);
  }
});
