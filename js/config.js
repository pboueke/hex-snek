var canvas = oCanvas.create({
    canvas: "#canvas"
});

var config = {
  show_numbers: false,
  hex_size: 20,
  grid_spacing: 7,
  grid_size: 271,
  starting_snek_size: 5,
  starting_snek_head: 0,
  snek_neck_bend: 2,
  clock: 100,
}

var global = {
  hex_types: {
    "empty": {
      "main_color" : "rgb(66, 66, 66)",
      "traversable": true,
      "food_weight": 0,
    },
    "snek_body": {
      "main_color" : "rgb(228, 182, 0)",
      "traversable": false,
      "food_weight": 0,
    },
    "snek_head": {
      "main_color" : "rgb(228, 126, 0)",
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

var clamp = function (value, max, min) {
  "use strict";
  if (value > max) { return max; }
  if (value < min){ return min; }
  return value;
}