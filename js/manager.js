g = new SimpleGrid();
s = new Snek();

var StartGame = function (snek_head, snek_size) {
  "use strict";
  var iterator = 0;
  g.createGrid(config.grid_size, config.grid_spacing, config.hex_size);
  for (iterator; iterator < snek_size; iterator++) {
    s.addToBody(g, snek_head, true)
  }
  s.createEyes(g);
  s.setDirection(getRandomInt(0,5));
  s.addDrop(g);
  canvas.redraw();

  Run();
}

function Run() {
  if (state.stop) { return; }
  state.score += s.move(g);
  canvas.redraw();
  //console.log (state.score);
  setTimeout(Run, config.clock);
}

StartGame(config.starting_snek_head, config.starting_snek_size);
