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

  var abs = ["#bpmDiv", "#bpcDiv", "#players2", "#visBeat", "#rep", "#buttons", "#muteDiv", "#metronome2", "#join", "#overlay", "#generateNewId"];
  for (var i = 0; i < abs.length; i++) {
    $(abs[i]).css("position", "absolute");
  }

  var fontThings = ["font-size", "body", "#beat", "#bpm", "#bpc", "#bpc2", "#sessionid"];
  var widths = ["width", "#bpmDiv", "#bpcDiv", "#players2", "#rep", "#visBeat", "#buttons", "#muteDiv", "#ob", "#metronome2"];
  var tops = ["top", "#bpmDiv", "#bpcDiv", "#players2", "#visBeat", "#rep", "#ob", "#buttons", "#muteDiv", "#metronome2"];
  var lefts = ["left", "#players2", "#visBeat", "#rep", "#muteDiv", "#metronome2", "#buttons"];
  var rights = ["right", , "#bpmDiv", "#bpcDiv"];
  var heights = ["height", "#players2", "#visBeat", "#ob", "#metronome2"]
  var arrOfStuff = [fontThings, widths, tops, lefts, rights, heights];

  var fontSizes = [35, 50, 25, 25, 25, 25];
  var widthSizes = [w * 0.5, w * 0.5, w - 5, w / 2, 100, w / 2 - 5, w * 0.6, w - 5, w / 2];
  var topSizes = [h * 0.36, h * 0.41, h * 0.5, h * 0.19, h * 0.02 + 30, h * 0.15, h * 0.20, h * 0.5 + 25, h * 0.15];
  var leftSizes = [0, w * 0.25 - 50, 0, w / 2, 0, w / 2];
  var rightSizes = [0, 0];
  var heightSizes = [h * 0.5, 80, h * 0.85, h * 0.85];

  $("#visBeat").css("padding-top", 20);
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
    $("#logo").css("left", 30);
    $("#logo").css("top", 30);
    $("#logo").css("width", 350);
    $("#sessionDisplay").html(document.querySelector("#sessionid").value);
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
    $("#logo").css("z-index", 201);
  }

  document.getElementById("join").addEventListener("click", function() {
    console.log("Joined successfully");
    session = true;
    prettify();
  });
}

function checkForLogo() {
  if ($("#text").length > 0) {
    $("#text").css("font-size", "25px");
    $("#text").css("background-color", "#303040");

    document.getElementsByTagName("div")[3].style.display = "none";
  } else {
    console.log("no logo found...");
    setTimeout(function() {
      checkForLogo();
    }, 250);
  }
};