// controls

document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '39') {
       // right arrow
       if (state.stop) { return; }
       s.clock_direction_delta = clamp(s.clock_direction_delta, config.snek_neck_bend, -config.snek_neck_bend) + 1;
       if (s.direction === 5) {return s.setDirection(0);}
       return s.setDirection(s.direction + 1);
    }
    else if (e.keyCode == '37') {
       // left arrow
       if (state.stop) { return; }
       s.clock_direction_delta = clamp(s.clock_direction_delta, config.snek_neck_bend, -config.snek_neck_bend) - 1;
       if (s.direction === 0) {return s.setDirection(5);}
       return s.setDirection(s.direction - 1);
    }
    else if (e.keyCode == '32') {
      // space bar
      if (s.alive)
      {
        changePlayState()
      }
    }
    else if (e.keyCode == '82') {
      // r
      RestartGame();
    }
}

// BTNS

document.getElementById("play-btn").addEventListener("click", changePlayState);
document.getElementById("reset-btn").addEventListener("click", RestartGame);

// UTILS


function RestartGame (){
  
  if (document.getElementById("canvas-wrapper").className.includes("blur")) {
    document.getElementById("canvas-wrapper").className = document.getElementById(divId).className.replace(" blur","");
  }
  document.getElementById("canvas-wrapper").className += " blur";
  s = new Snek();
  canvas.redraw();
  state.score = 0;
  state.stop = false;
  setTimeout( () => { 
    document.getElementById("canvas-wrapper").className = document.getElementById("canvas-wrapper").className.replace(" blur","")
    StartGame(config.starting_snek_head, config.starting_snek_size);
  }, 500);
}

function changePlayState() {
  toggleBlur("canvas-wrapper");
  if (state.stop) {
    document.getElementById("play-btn").className = document.getElementById("play-btn").className.replace(" selected","")
    setTimeout(()=>{
      state.stop = !state.stop; 
      document.getElementById("play-btn-img").src="img/pause.svg";
      Run();
    }, 300);
  } else { 
    state.stop = !state.stop;
    document.getElementById("play-btn-img").src="img/play.svg";
    document.getElementById("play-btn").className += " selected"; }
};

function toggleBlur(divId) {
  if (document.getElementById(divId).className.includes("blur")) {
    document.getElementById(divId).className = document.getElementById(divId).className.replace(" blur","");
  } else {
    document.getElementById(divId).className += " blur";
  }
}


// DIALOGS

function showAbout() {
  swal({
  title: 'Hex-Snek',
  type: 'info',
  html:
  'Game developed by <a href="https://pboueke.github.io/b/">pboueke</a>.<br>' +
  ' You can view the source <a href="https://github.com/pboueke/hex-snek">here</a>.<br> ' +
  ' Cheers!',
  confirmButtonText: 'Close!',
  customClass: 'info-box'
})
}

function showConfig() {
  swal({
    title: 'Settings',
    type: 'question',
    html:
    'Ooops..! Sorry, nothing to see here just yet.<br>',
    confirmButtonText: 'Close!',
    customClass: 'info-box'
  })
}
