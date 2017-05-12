var canvas = oCanvas.create({
    canvas: "#canvas"
});

var state = {
  score: 0,
  stop: false,
}

var config = {
  show_numbers: false,
  hex_size: 20,
  grid_spacing: 7,
  grid_size: 271,
  starting_snek_size: 5,
  starting_snek_head: 0,
  snek_neck_bend: 2,
  drop_score: 50,
  walk_score: 1,
  clock: 100,
}

var global = {
  snek_head_color: "#e47e00",
  snek_tail_color: "#e4b600",
  hex_types: {
    "empty": {
      "main_color" : "rgb(66, 66, 66)",
      "traversable": true,
      "food_weight": 0,
    },
    "snek_body": {
      //"main_color" : "rgb(228, 182, 0)",
      "traversable": false,
      "food_weight": 0,
    },
    "snek_head": {
      //"main_color" : "rgb(228, 126, 0)",
      "traversable": false,
      "food_weight": 0,
    },
    "drop": {
      "main_color" : "rgb(64, 100, 209)",
      "traversable": true,
      "food_weight": 1,
    },
  },
  snek_eyes_size_multiplier: 2,
}

// UTILS
var clamp = function (value, max, min) {
  "use strict";
  if (value > max) { return max; }
  if (value < min){ return min; }
  return value;
}

var getRandomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
