let host = document.getElementById("host");
let join = document.getElementById("join");
var hostDup = document.getElementById("hostDup");
var arr = [join, host, hostDup];
var arrToListen = 2;
var buts = document.getElementsByTagName("button");
var text = document.getElementsByTagName("p");
var inp = document.getElementsByTagName("input");

buts[0].addEventListener("click", function() {
  button(1);
});
buts[3].addEventListener("click", function() {
  if (arrToListen != 0) {
    button(2);
  } else {
    submitSessionId();
  }
});

arr[0].addEventListener("click", function() {
  if (arrToListen == 0) {
    reset();
    arrToListen = 2;
  }
});
arr[2].addEventListener("click", function() {
  reset();
});

function button(n) {
  if (n == 1) {
    host.style.width = 100 + "%";
    text[0].style.display = "inline";
    buts[1].style.display = "inline";
    buts[2].style.display = "inline";
    buts[3].style.display = "none";
    if (1 < 0) {
      buts[2].disabled = true;
      buts[2].setAttribute("title", "No sessions to control");
    } else {
      buts[2].setAttribute("title", "");
      buts[2].disabled = false;
    }
    buts[0].style.display = "none";
    arr[n - 1].style.width = "10%";
    arrToListen = 0;
  } else if (n == 2) {
    join.style.width = 90 + "%";
    text[1].style.display = "inline";
    inp[0].style.display = "inline";
    inp[0].focus();
    buts[3].style.top = "110px";
    buts[3].style.marginLeft = "3px";
    buts[3].style.fontSize = "1.75em";
    buts[0].style.display = "none";
    setTimeout(() => {
      hostDup.style.display = "inline";
    }, 550);
    host.style.width = "30%";
    arrToListen = 2;
  }
  var temp = [2, 1];
  arr[n - 1].setAttribute("class", "hoverable");
}

function reset(followUp) {
  buts[0].style.display = "inline";
  buts[3].style.display = "inline";
  buts[3].style.top = "30%";
  buts[3].style.marginLeft = "";
  buts[3].style.fontSize = "2.5em";
  inp[0].style.display = "none";
  hostDup.style.display = "none";
  for (var i = 0; i < 2; i++) {
    arr[i].setAttribute("onClick", "");
    arr[i].setAttribute("class", "");
    arr[i].style.width = "50%";
    text[i].style.display = "none";
    buts[i + 1].style.display = "none";
  }
  setTimeout(() => {
    if (followUp) {
      // button(followUp);
    }
  }, 400);
}

function submitSessionId() {
  console.log("Session id: " + inp[0].value);
}