var socket = io();

var game = new Vue({
  el: "#ui",
  data: {
  },
  methods: {
    plantingMode: function(seed){
      console.log(seed);
    },
    fillFarm: function(farm){
      this.$data = farm;
    }
  }
});

socket.emit("createFarm", "bob", "blop", function(farm){
  if(farm){
    game.fillFarm(farm);
  }
  else {
    console.error("SOMEONE ELSE LOGGED IN DINGUS");
  }
});
