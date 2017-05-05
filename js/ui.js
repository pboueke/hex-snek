// controls

document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '39') {
       // right arrow
       if (s.direction === 5) {return s.setDirection(0);}
       return s.setDirection(s.direction + 1);
    }
    else if (e.keyCode == '37') {
       // left arrow
       if (s.direction === 0) {return s.setDirection(5);}
       return s.setDirection(s.direction - 1);
    }
    else if (e.keyCode == '32') {
      state.stop = !state.stop;
      if (!state.stop) {
        Run();
      }
    }

}