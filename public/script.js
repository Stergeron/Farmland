var socket = io();

var game = new Vue({
  el: "#ui",
  data: {
    player: {},
    planting: "",
    name: "bob"
  },
  methods: {
    plantingMode: function(seed){
      this.planting = seed;
    },
    plant: {

    },
    fillFarm: function(farm){
      this.player = farm;
    }
  }
});

socket.emit("createFarm", game.name, "blop", function(farm){
  if(farm){
    game.fillFarm(farm);
  }
  else {
    console.error("SOMEONE ELSE LOGGED IN DINGUS");
  }
});
