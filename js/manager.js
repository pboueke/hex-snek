g = new SimpleGrid();
s = new Snek();

var StartGame = function (snek_head, snek_size) {
  "use strict"
  var iterator = 0;
  g.createGrid(config.grid_size, config.grid_spacing, config.hex_size);
  for (iterator; iterator < snek_size; iterator++) {
    s.addToBody(g, snek_head, true)
  }
  canvas.redraw();

  Run();
}

StartGame(config.starting_snek_head, config.starting_snek_size);

function Run() {
  s.move(g);
  canvas.redraw();
  setTimeout(Run, config.clock);
}
