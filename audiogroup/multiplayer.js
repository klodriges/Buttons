
function multiPlayer(target, sequencer, timingobjects) {

  let API = {
    syncs: {}
  };

  function prettyTime(val) {
    var s = "";
    if (val < 0)
      s = "-";
    val = Math.abs(val); // Might get times in the future!
    /* Convert time in seconds to X days, hours, minutes, seconds */
    var days = Math.floor(val / (60 * 60 * 24));
    var hours = Math.floor((val - days * (60 * 60 * 24)) / (60 * 60));
    var mins = Math.floor((val - days * (60 * 60 * 24) - hours * (60 * 60)) / (60));
    var secs = Math.floor((val - days * (60 * 60 * 24) - hours * (60 * 60)) - mins * 60);
    if (days > 0) s += days + "d ";
    if (hours > 0) s += hours + "h ";
    if (days == 0) {
      if (mins > 0) s += mins + "m ";
    }
    if (days === 0 || hours === 0) {
      s += secs + "s"
    }
    return s;
  }

  timingobjects.record.on("change", function() {
    target.querySelectorAll(".player audio").forEach(function(a) {
      a.src = a.getAttribute("url");
    });
  });

  setInterval(function() {
    target.querySelectorAll(".player").forEach(function(player) {
      let ts = parseFloat(player.getAttribute("ts"));
      let diff = timingobjects.epoc.pos - ts;
      player.querySelector(".timestamp").innerHTML = prettyTime(diff);
    });
  }, 1000)

  sequencer.on("change", function(evt) {
    let item = evt.data;
    let val = item.value;
    if (item.name == "profile") {
      // Create a player
      let player = target.querySelector("#player" + evt.key);
      if (!player) {
        let temp = document.querySelector("#template_player");
        var clone = temp.content.cloneNode(true);
        player = clone.querySelector("div");
        player.setAttribute("id", "player" + evt.key);
        target.append(player);
        player.addEventListener("click", function(evt) {
          toggleMute(player);
        });
      }
      if (!API.syncs[evt.key]) {
        API.syncs[evt.key] = MCorp.mediaSync(player.querySelector("audio"), timingobjects.playback, {skew: -val.offset});
      } else {
        API.syncs[evt.key].setSkew(-val.offset);
      }
      player.querySelector("audio").setAttribute("url", val.url);

      if (timingobjects.record.pos == 0) {
        player.querySelector("audio").src = val.url;
      }
      player.querySelector(".name").innerHTML = val.name;
      player.setAttribute("ts", item.epoc)
      player.querySelector(".timestamp").innerHTML = "";
      player.querySelector(".pic").src = val.pic;
    }
  });

  sequencer.on("remove", function(evt) {
    console.log("Removing player", evt);
    let player = target.querySelector("#player" + evt.key);
    if (player) {
      player.parentElement.removeChild(player);
    };
    if (API.syncs[evt.key]) {
      API.syncs[evt.key].stop();
      delete API.syncs[evt.key];
    }
  });

  let toggleMute = function(item) {
    if (item.querySelector("audio").muted) {
      unmute(item);
    } else {
      mute(item);
    }
  };

  let mute = function(item) {
    if (!item || !item.querySelector("audio")) return;  // not ready yet
    item.querySelector("audio").muted = true;
    item.classList.add("muted");
  };

  let unmute = function(item) {
    if (!item || !item.querySelector("audio")) return;  // not ready yet
    item.querySelector("audio").muted = false;
    item.classList.remove("muted");
  };

  API.muteAll = function() {
    target.querySelectorAll(".player").forEach(function(elem) { 
      mute(elem);
    });
  }

  API.unmuteAll = function() {
    target.querySelectorAll(".player").forEach(function(elem) { 
      unmute(elem);
    });
  }

  API.mutePlayer = function(playerid) {
    mute(target.querySelector("#player" + playerid));
  }
  API.unmutePlayer = function(playerid) {
    unmute(target.querySelector("#player" + playerid));
  }
  return API;
}
