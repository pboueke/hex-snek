function Snek() {
  "use strict"
  this.body = [];
  this.wait = false;
  this.direction = 1;
}

Snek.prototype.addToBody = function (g, id, ignore_restrictions) {
  /* If ignore_restrictions is true, the function will always add, ignoring any restrictions */
  "use strict"
  var wont_ignore_restrictions = (ignore_restrictions) ? false : true;
  if (wont_ignore_restrictions) {
    // returns false if the id is greater tha the grid size
    if (id > g.grid.length) {
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
    g.grid[this.body[0]].hexagon.fill = global.hex_types["snek_body"]["main_color"]
  }
  this.body.unshift(id);
  g.grid[this.body[0]].hexagon.fill = global.hex_types["snek_head"]["main_color"]
  return true;
}

Snek.prototype.move = function(g) {
  "use strict"
  var next_hex_id,
      iterator,
      aux_int;
  // get the hex for the next clock cycle
  next_hex_id = g.grid[this.body[0]].grid_index.getOrderedNeighbors(this.body[0])[this.direction];
  // you die! (not a traversable tile)
  if (next_hex_id > g.grid.length || !global.hex_types[g.grid[next_hex_id].tp]["traversable"]) {
    console.log("snek dead")
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
      g.grid[this.body[iterator]].hexagon.fill = global.hex_types["snek_body"]["main_color"]
    }
    g.grid[this.body[0]].hexagon.fill = global.hex_types["snek_head"]["main_color"]
    g.grid[next_hex_id].hexagon.fill = global.hex_types["empty"]["main_color"]
  }
}
