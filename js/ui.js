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
      changePlayState()
    }
}

// BTNS

document.getElementById("play-btn").addEventListener("click", changePlayState);

// UTILS

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
  title: '<i>HTML</i> <u>example</u>',
  type: 'info',
  html:
    'You can use <b>bold text</b>, ' +
    '<a href="//github.com">links</a> ' +
    'and other HTML tags',
  showCloseButton: true,
  showCancelButton: true,
  confirmButtonText:
    '<i class="fa fa-thumbs-up"></i> Great!',
  cancelButtonText:
    '<i class="fa fa-thumbs-down"></i>'
})
}
