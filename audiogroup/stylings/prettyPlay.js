var closeShit = true;
var session = false;
$(document).ready(function() {
  console.log("Making it pretty")
  prettify();

  $("#showSec").click(function() {
    if (closeShit) {
      closeShit = false;
    } else {
      closeShit = true;
    }
    prettify();
  })
  top1();
  met();
});

function changeImg() {
  document.getElementById("newImg").setAttribute("src", "refreshB.png");
}

function fixImg() {
  document.getElementById("newImg").setAttribute("src", "refreshO.png");
}

$(window).resize(function() {
  prettify();
});


function prettify() {
  var w = $(window).width();
  var h = $(window).height();

  var abs = ["#bpmDiv", "#bpcDiv", "#players2", "#buttons", "#muteDiv", "#join", "#overlay", "#generateNewId"];
  for (var i = 0; i < abs.length; i++) {
    $(abs[i]).css("position", "absolute");
  }

  var fontThings = ["font-size", "body", "#beat", "#bpm", "#bpc", "#bpc2", "#sessionid"];
  var widths = ["width", "#bpmDiv", "#bpcDiv", "#players2", "#buttons", "#muteDiv", "#ob"];
  var tops = ["top", "#bpmDiv", "#bpcDiv", "#players2", "#ob", "#buttons", "#muteDiv"];
  var lefts = ["left", "#players2", "#muteDiv", "#buttons"];
  var rights = ["right", , "#bpmDiv", "#bpcDiv"];
  var heights = ["height", "#players2", "#ob"]
  var arrOfStuff = [fontThings, widths, tops, lefts, rights, heights];

  var fontSizes = [35, 50, 25, 25, 25, 25];
  var widthSizes = [w * 0.5, w * 0.5, w - 5, w / 2 - 5, w * 0.6, w - 5];
  var topSizes = [h * 0.36, h * 0.41, h * 0.5, h * 0.19, h * 0.15, h * 0.20, h * 0.5 + 25];
  var leftSizes = [0, w / 2, w / 2];
  var rightSizes = [0, 0];
  var heightSizes = [h * 0.5, h * 0.85];

  $("#bpcDiv").css("right", 0);

  var arrOfSizes = [fontSizes, widthSizes, topSizes, leftSizes, rightSizes, heightSizes];

  for (var i = 0; i < arrOfStuff.length; i++) {
    for (var j = 0; j < arrOfStuff[i].length; j++) {
      $(arrOfStuff[i][j + 1]).css(arrOfStuff[i][0], arrOfSizes[i][j]);
    }
  }

  if (session) {
    var stuff = ["#overlay", "#join", "#sesDiv", "#generateNewId"];
    for (var i = 0; i < stuff.length; i++) {
      $(stuff[i]).css("display", "none");
      $(stuff[i]).css("width", 0);
      $(stuff[i]).css("height", 0);
    }
    if (document.querySelector(".top1Text").innerHTML.substr(-7) != "</span>") document.querySelector(".top1Text").innerHTML += "<span style='color: white'>" + document.querySelector("#sessionid").value + "</span>";
  } else {
    var stuff = ["#join", "#sesDiv", "#logo", "#generateNewId"];
    var stuffNums = [h * 0.6, w * 0.3, w * 0.4, h * 0.35, w * 0.3, w * 0.5, h * 0.25, 0, w, h * 0.345, w * 0.6, 100];
    for (var i = 0; i < stuff.length; i++) {
      $(stuff[i]).css("top", stuffNums[i * 3]);
      $(stuff[i]).css("left", stuffNums[1 + i * 3]);
      $(stuff[i]).css("width", stuffNums[2 + i * 3]);
    }
    $("#overlay").css("width", w);
    $("#overlay").css("height", h);
    $("#join").css("height", h * 0.1);
    $("#sesDiv").css("font-size", 40);
  }

  document.getElementById("join").addEventListener("click", function() {
    console.log("Joined successfully");
    session = true;
    prettify();
  });
}

function checkForLogo() {
  if (document.querySelector("#text")) {
    for (var i = 0; i < 2; i++) {
      document.querySelectorAll("#text")[i].style.fontSize = "25px";
      document.querySelectorAll("#text")[i].style.backgroundColor = "#303040";
    }

    document.getElementsByTagName("div")[3].style.display = "none";
    document.getElementsByTagName("div")[15].style.display = "none";
  } else {
    console.log("no logo found...");
    setTimeout(function() {
      checkForLogo();
    }, 250);
  }
};


function top1() {
  target = document.querySelector("#top1");
  var e = document.createElement("div");
  e.innerHTML += '<div class="top1Collapse"><img src="collapse.png"></div><div class="top1Title"></div>'
  var options = ["File", "Record", "Help", "Options"];
  for (var i = 0; i < options.length; i++) {
    e.innerHTML += "<div class='top1Option'>" + options[i] + "</div>";
  }
  e.innerHTML += '<div class="top1Text">Session id: </div>'
  target.appendChild(e);

  target = document.querySelector("#sideBar");
  var e = document.createElement("div");
  for (var i = 0; i < options.length; i++) {
    e.innerHTML += "<a>" + options[i] + "</a>";
  }
  target.appendChild(e);

  var collapsed = true;
  document.querySelector(".top1Collapse").addEventListener("click", function() {
    if (collapsed) {
      document.getElementById("sideBar").style.width = "250px";
      document.getElementById("main").style.marginLeft = "250px";
      collapsed = false;
    } else {
      document.getElementById("sideBar").style.width = "0";
      document.getElementById("main").style.marginLeft = "0";
      collapsed = true;
    }
  });

}

function met() {
  target = document.querySelector("#met");
  var e = document.createElement("div");
  e.innerHTML += '<div id="rep">0</div><div id="visBeat"><div id="beat">1</div></div>';
  target.appendChild(e);
}