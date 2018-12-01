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
  UpdateScore(s.move(g) * s.body.length)
  s.updateColors();
  canvas.redraw();
  //console.log (state.score);
  setTimeout(Run, config.clock);
}

function UpdateScore(increment) {
  state.score += increment;
  document.getElementById("score").innerHTML = state.score.toString().padStart(14, '0');;
} 

StartGame(config.starting_snek_head, config.starting_snek_size);
