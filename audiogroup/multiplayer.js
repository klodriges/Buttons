function multiPlayer(target, sequencer, timingobjects, options) {

  let API = {
    syncs: {}
  };
  options = options || {};
  let all_muted = false;
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
  
    if (days > 0) {
      if (days == 1) return "1 day";
      return days + " days";
    }
    if (hours > 0) {
      if (hours == 1) return "1 hour";
      return hours + " hours";
    }
    if (mins > 0) {
      if (mins == 1) return "1 minute";
      return mins + " minutes";
    }
    return "now";
  }

  timingobjects.record.on("change", function() {
    target.querySelectorAll(".player audio").forEach(function(a) {
      if (a.getAttribute("url"))
        a.src = a.getAttribute("url");
    });
  });

  setInterval(function() {
    target.querySelectorAll(".player").forEach(function(player) {
      if (timingobjects.epoc.pos == 0) return;
      let ts = parseFloat(player.getAttribute("ts"));
      let diff = timingobjects.epoc.pos - ts;
      player.querySelector(".timestamp").innerHTML = prettyTime(diff);
    });
  }, 1000)

  sequencer.on("change", function(evt) {
    let item = evt.data;
    let val = item.value;
    if (item.name == "profile") {
      console.log("Loading profile", item);
      // Create a player
      let player = target.querySelector("#player" + evt.key);
      if (!player) {
        let temp = document.querySelector("#template_player");
        var clone = temp.content.cloneNode(true);
        player = clone.querySelector("div");
        player.setAttribute("id", "player" + evt.key);
        player.setAttribute("key", evt.key);
        if (all_muted) {
          console.log("Adding muted");
          mute(player);
        }  else {
          console.log("Not muted");
        }
        target.append(player);
        player.addEventListener("click", function(evt) {
          toggleMute(player);
        });

        if (options.onplayernew) {
          setTimeout(function() {
            options.onplayernew(player);
          }, 0);
        }        
      }
      if (!API.syncs[evt.key]) {
        API.syncs[evt.key] = MCorp.mediaSync(player.querySelector("audio"), timingobjects.playback, {
          skew: -val.offset
        });
      } else {
        API.syncs[evt.key].setSkew(-val.offset);
      }
      if (val.url)
        player.querySelector("audio").setAttribute("url", val.url);

      if (timingobjects.record.pos == 0 && val.url) {
        player.querySelector("audio").src = val.url;
      }
      // If pre-recorded, adjust volume a bit down
      if (val.uploaded) {
        player.querySelector("audio").volume = 0.5;
      } else {
        player.querySelector("audio").volume = 1;
      }
      player.querySelector(".name").innerHTML = val.name.length > 16 ? val.name.substr(0, 16) + "..." : val.name;
      player.setAttribute("ts", item.epoc)
      player.querySelector(".timestamp").innerHTML = "";
      player.querySelector(".pic").src = val.pic;
      if (val.locked || val.pinned) {
        player.querySelector(".lock").innerHTML = "lock";
      } else {
        player.querySelector(".lock").innerHTML = "lock_open";
      }
      if (val.mic) {
        player.querySelector(".mic").innerHTML = "mic";        
      } else {
        player.querySelector(".mic").innerHTML = "mic_off";
      }
      if (options.onplayerupdate) {
        setTimeout(function() {
          options.onplayerupdate(player);
        }, 0);
      }
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
    if (!item || !item.querySelector("audio")) return; // not ready yet
    item.querySelector("audio").muted = true;
    item.classList.add("muted");
  };

  let unmute = function(item) {
    if (!item || !item.querySelector("audio")) return; // not ready yet
    item.querySelector("audio").muted = false;
    item.classList.remove("muted");
  };

  API.muteAll = function() {
    all_muted = true;
    target.querySelectorAll(".player").forEach(function(elem) {
      mute(elem);
    });
  }

  API.unmuteAll = function() {
    all_muted = false;
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