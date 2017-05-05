function Snek() {
  "use strict";
  this.body = [];
  this.direction = 1;
  this.eyes;
}

Snek.prototype.createEyes = function(g) {
  "use strict";
  if (this.body.length < 1) {
    throw "Sssnek must have size to have eyesss!";
  }
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
    }
    // returns false if id is not "traversable"
    if (!global.hex_types[g.grid[id].tp]["traversable"]) {
      return false;
    }
    // returns false if id already in body
    if (this.body.indexOf(id) > -1) {
      return false;
    }
    // returns false if id not in neighborhood of head
    if (this.body.length > 0 &&
        g.grid[id].grid_index.getNeighbors(this.body[0]).indexOf(id) < 0) {
          return false;
    }
  }
  // the new hex becomes the head
  if (this.body.length > 0) {
    changeHexType(g, this.body[0], "snek_body");
  }
  this.body.unshift(id);
  changeHexType(g, this.body[0], "snek_head");
  return true;
};

Snek.prototype.move = function(g) {
  // moves the entire snek 1 tile in the this.direction
  "use strict";
  var next_hex_id,
      iterator,
      aux_int;
  // get the hex for the next clock cycle
  next_hex_id = g.grid[this.body[0]].grid_index.getOrderedNeighbors(this.body[0])[this.direction];
  console.log(next_hex_id)
  // you die! (not a traversable tile)
  if (next_hex_id > g.grid.length - 1 || !global.hex_types[g.grid[next_hex_id].tp]["traversable"]) {
    console.log("snek dead");
    // TODO: death
  } // you eat! (increase snek size or add points)
  else if (global.hex_types[g.grid[next_hex_id].tp]["food_weight"] > 0) {
    this.addToBody(g, next_hex_id);
    // TODO: add points
  } // walk
  else {
    for (iterator = 0; iterator < this.body.length; iterator++) {
      aux_int = this.body[iterator];
      this.body[iterator] = next_hex_id;
      next_hex_id = aux_int;
      changeHexType(g, this.body[iterator], "snek_body");
    }
    changeHexType(g, this.body[0], "snek_head");
    changeHexType(g, next_hex_id, "empty");
    // update eyes
    this.eyes.x = g.grid[this.body[0]].hexagon.x;
    this.eyes.y = g.grid[this.body[0]].hexagon.y;
  }
};

Snek.prototype.setDirection = function (new_direction) {
  /* Sets the new direction to the class and moves the snek`s eyes */
  "use strict";
  this.direction = new_direction;
  this.rotateEyes();
};
