function Snek() {
  "use strict";
  this.body = [];
  this.direction = 1;
  this.eyes;
  this.clock_direction_delta = 0;
  this.alive = true;
  this.rainbow = new Rainbow();
  this.rainbow.setSpectrum(global.snek_head_color, global.snek_tail_color);
  this.rainbow.setNumberRange(0, config.starting_snek_size);
};

Snek.prototype.createEyes = function(g) {
  "use strict";
  if (this.body.length < 1) {
    throw "Sssnek must have size to have eyesss!";
  };
  var head = g.grid[this.body[0]];
  this.eyes = canvas.display.image({
      x: head.hexagon.x + global.snek_eyes_x_pos_diff,
      y: head.hexagon.y + global.snek_eyes_y_pos_diff,
      image: "img/snek_eyes.png",
      width: head.hexagon.radius * global.snek_eyes_size_multiplier,
      height: head.hexagon.radius * global.snek_eyes_size_multiplier,
      origin: { x: "center", y: "center" },
  });
  canvas.addChild(this.eyes);
};

Snek.prototype.rotateEyes = function (direction) {
  "use strict";
  var dir = (direction || direction === 0) ? direction : this.direction;
  this.eyes.rotation = 30 + dir * 60;
  canvas.redraw();
};

Snek.prototype.addToBody = function (g, id, ignore_restrictions) {
  /* Adds a tile to the snake body if possible.
    If ignore_restrictions is true, it will always add ignoring any restrictions.
   */
  "use strict";
  var wont_ignore_restrictions = (ignore_restrictions) ? false : true;
  if (wont_ignore_restrictions) {
    // returns false if the id is greater tha the grid size
    if (id > g.grid.length - 1) {
      return false;
    };
    // returns false if id is not "traversable"
    if (!global.hex_types[g.grid[id].tp]["traversable"]) {
      return false;
    };
    // returns false if id already in body
    if (this.body.indexOf(id) > -1) {
      return false;
    };
    // returns false if id not in neighborhood of head
    if (this.body.length > 0 &&
        g.grid[id].grid_index.getNeighbors(this.body[0]).indexOf(id) < 0) {
          return false;
    };
  };
  // the new hex becomes the head
  if (this.body.length > 0) {
    changeHexType(g, this.body[0], "snek_body");
  }
  this.body.unshift(id);
  changeHexType(g, this.body[0], "snek_head");
  this.updateEyes(g);
  return true;
};

Snek.prototype.updateColors = function() {
  "use strict";
  var i;
  this.rainbow.setNumberRange(0,this.body.length);
  changeHexType(g, this.body[0], "snek_head", this.rainbow.colourAt(0));
  for (i = 1; i < this.body.length; i++) {
    changeHexType(g, this.body[i], "snek_body", this.rainbow.colourAt(i));
  }
}

Snek.prototype.move = function(g) {
  // moves the entire snek 1 tile in the this.direction
  "use strict";
  var next_hex_id,
      iterator,
      aux_int;
  this.clock_direction_delta = 0;
  // get the hex for the next clock cycle
  next_hex_id = g.grid[this.body[0]].grid_index.getOrderedNeighbors(this.body[0])[this.direction];
  // you die! (not a traversable tile)
  if (next_hex_id > g.grid.length - 1 || !global.hex_types[g.grid[next_hex_id].tp]["traversable"]) {
    console.log("snek dead");
    this.Kill();
    return 0;
  } // you eat! (increase snek size or add points)
  else if (global.hex_types[g.grid[next_hex_id].tp]["food_weight"] > 0) {
    this.addToBody(g, next_hex_id);
    this.addDrop(g);
    return parseInt(config.drop_score * Math.sqrt(this.body.length));
  } // walk
  else {
    for (iterator = 0; iterator < this.body.length; iterator++) {
      aux_int = this.body[iterator];
      this.body[iterator] = next_hex_id;
      next_hex_id = aux_int;
      changeHexType(g, this.body[iterator], "snek_body");
    };
    changeHexType(g, this.body[0], "snek_head");
    changeHexType(g, next_hex_id, "empty");
    // update eyes
    this.updateEyes(g);
    return config.walk_score;
  };
};

Snek.prototype.setDirection = function (new_direction) {
  /* Sets the new direction to the class and moves the snek`s eyes */
  "use strict";
  if (Math.abs(this.clock_direction_delta) > config.snek_neck_bend) {
    return;
  }
  this.direction = new_direction;
  this.rotateEyes();
};

Snek.prototype.updateEyes = function (g) {
  "use strict";
  if (this.body.length < 1 || !this.eyes) { return; }
  this.eyes.x = g.grid[this.body[0]].hexagon.x;
  this.eyes.y = g.grid[this.body[0]].hexagon.y;
};

Snek.prototype.addDrop = function (g) {
  "use strict";
  var new_pos = this.body[0];
  while (this.body.indexOf(new_pos) !== -1) {
    new_pos = getRandomInt(0,g.grid.length-1);
  };
  changeHexType(g,new_pos,"drop");
  if (this.body.length === g.grid.length) {
    // TODO: end game!
  };
};

Snek.prototype.Kill = function() {
  "use strict";
  state.stop = true;
  this.alive = false;
  var head = g.grid[this.body[0]];
  var dead_eyes = canvas.display.image({
      x: this.eyes.x,
      y: this.eyes.y,
      image: "img/dead_snek_eyes.png",
      width: this.eyes.width,
      height: this.eyes.height,
      origin: { x: "center", y: "center" },
      rotation: this.eyes.rotation,
  });
  canvas.removeChild(this.eyes);
  this.eyes = dead_eyes;
  canvas.addChild(this.eyes);
};
