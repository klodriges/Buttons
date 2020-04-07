var closeShit = true;
var w, h, session;
$(document).ready(function() {
  session = false;
  console.log("Making it pretty")
  w = $(document).width();
  h = $(document).height();
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

$(window).resize(function() {
  w = $(window).width();
  h = $(window).height();
  prettify();
});


function prettify() {

  var abs = ["#nameDiv", "#checkDiv", "#metronome", "#rep", "#beat", "#bpmDiv", "#bpcDiv", "#visBeat", "#sent", "#status", "#players", "#sesDiv", "#overlay", "#join"];
  for (var i = 0; i < abs.length; i++) {
    $(abs[i]).css("position", "absolute");
  }

  var fontThings = ["font-size", "body", ".name", "#status", "#sent", "#sessionid", "#nameDiv"];
  var widths = ["width", ".name", "#nameDiv", "#status", "#sent", "#metronome", "#rep", "#bpmDiv", "#bpcDiv", "#players", "#checkDiv"];
  var tops = ["top", "#nameDiv", "#status", "#sent", "#checkDiv", , "#metronome", "#rep", "#visBeat", "#bpmDiv", "#bpcDiv", "#players"];
  var displayStuff = ["display", "#showSec", "#players"];
  var lefts = ["left", "#nameDiv", "#metronome", "#rep", "#visBeat", "#bpmDiv", "#bpcDiv", "#status", "#sent"];
  var rights = ["right", "#nameDiv", "#checkDiv", "#players"];
  var heights = ["height", "#metronome", "#players", "#checkDiv", "#overlay"]
  var arrOfStuff = [fontThings, widths, tops, displayStuff, lefts, rights, heights];
  $("#players").css("padding-left", w * 0.02 - 5);
  $("#players").css("padding-top", h * 0.05);

  if (w > 900) {

    var fontSizes = [25, 30, 30, 30, 30, 30];
    var widthSizes = ["50%", "50%", w * 0.3, w * 0.3, w * 0.5 - 3, w * 0.5 - 3, w * 0.25, w * 0.25, w * 0.48, "16%"];
    var topSizes = [20, h * 0.1, h * 0.1, 10, 8, h * 0.15, h * 0.1, h * 0.4 - $("#visBeat").height() / 2, h * 0.8, h * 0.8, h * 0.15];
    var displayStates = ["none", "inline"];
    var leftSizes = ["", 0, 0, w * 0.25 - $("#visBeat").width() / 2, 0, w * 0.25, 35, w * 0.3];
    var rightSizes = [0, 30, 0];
    var heightSizes = [h * 0.85 - 5, h * 0.85 - 5, h * 0.1, h];

    var arrOfSizes = [fontSizes, widthSizes, topSizes, displayStates, leftSizes, rightSizes, heightSizes];

    $("#status").css("color", "orange");
    $("#sent").css("color", "orange");


  } else {

    var fontSizes = [15, 25, 30, 30, 15, 25];
    var topSizes = [h * 0.1, h * 0.25, h * 0.21, h * 0.09, 0, h * 0.20, h * 0.2, h / 2 - $("#visBeat").height() / 2, h * 0.85, h * 0.85, h * 0.20];
    var leftSizes = [35, 0, w / 2 - 30, w / 2 - $("#visBeat").width() / 2, 0, w * 0.5, 30, 30];
    var rightSizes = ["", 20, 0];
    var heightSizes = [h * 0.80 - 5, h * 0.80 - 5, h * 0.085, h];
    $("#status").css("color", "orange");
    $("#sent").css("color", "orange");

    if (closeShit) {
      var widthSizes = [w * 0.4, w * 0.5, w * 0.6, w * 0.6, w - 5, 60, w * 0.5, w * 0.5, "", "", w * 0.4];
      var displayStates = ["inline", "none"];
      $("#showSec").html("More info");

    } else {
      var widthSizes = [w * 0.4, w * 0.5, w * 0.6, w * 0.6, w * 0.5 - 5, 60, w * 0.5, w * 0.5, w * 0.48, w * 0.48, w * 0.4];
      var displayStates = ["inline", "inline"];
      $("#showSec").html("Close info");
    }

    arrOfStuff = [fontThings, widths, tops, displayStuff, lefts, rights, heights];
    var arrOfSizes = [fontSizes, widthSizes, topSizes, displayStates, leftSizes, rightSizes, heightSizes];

  }

  if (rec) {
    $("#checkDiv").css("background", "linear-gradient(45deg, #D8A62F 5%, #FC8E00 100%)");
    $("#checkDiv").html("Recording allowed");
    $("#checkDiv").css("color", "rgb(30, 30, 40)");
  } else {
    $("#checkDiv").css("background", "rgb(30, 30, 40)");
    $("#checkDiv").html("Allow recording");
    $("#checkDiv").css("color", "orange");
  }

  for (var i = 0; i < arrOfStuff.length; i++) {
    for (var j = 0; j < arrOfStuff[i].length; j++) {
      $(arrOfStuff[i][j + 1]).css(arrOfStuff[i][0], arrOfSizes[i][j]);
    }
  }

  if (session) {
    var stuff = ["#overlay", "#sesDiv", "#join"];
    for (var i = 0; i < stuff.length; i++) {
      $(stuff[i]).css("display", "none");
      $(stuff[i]).css("width", 0);
      $(stuff[i]).css("height", 0);
    }
    $("#nameDiv").css("z-index", 1);
    $("#logo").css("left", 30);
    $("#logo").css("top", 30);
    $("#logo").css("width", 350);
  } else {
    var stuff = ["#join", "#sesDiv", "#nameDiv", "#logo"];
    var stuffNums = [h * 0.6, w * 0.3, w * 0.4, h * 0.35, w * 0.1, w * 0.5, h * 0.35, w * 0.6, w * 0.5, h * 0.25, 0, w];
    for (var i = 0; i < stuff.length; i++) {
      $(stuff[i]).css("top", stuffNums[i * 3]);
      $(stuff[i]).css("left", stuffNums[1 + i * 3]);
      $(stuff[i]).css("width", stuffNums[2 + i * 3]);
      $(stuff[i]).css("z-index", 201);
    }
    $("#join").css("height", h * 0.1);
    $("#sesDiv").css("font-size", 40);
    $("#nameDiv").css("font-size", 40);

    $(".name").css("width", w * 0.3);
    $(".name").css("font-size", 30);
  }
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