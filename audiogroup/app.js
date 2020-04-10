var sesid;
$(document).ready(function() {
  if (localStorage._sessionid_) {
    document.querySelector("#sessionid").value = localStorage._sessionid_;
    if ($(".ses2").length > 0) generateNewIdFunction(false);
  } else {
    if ($(".ses2").length > 0) {
      generateNewIdFunction(true);
    }
  }
  document.querySelector("#sessionid").addEventListener("change", function() {
    console.log("Session id changed");
    localStorage._sessionid_ = this.value;
  });
  MCorp.attribution(document.querySelector("#logo"), true);
  checkForLogo();

  if ($("#generateNewId").length > 0) {
    $("#generateNewId").click(function() {
      generateNewIdFunction(true);
    })
  }
});

function generateNewIdFunction(makeNew) {
  if (makeNew) {
    sesid = genID();
  } else {
    sesid = localStorage._sessionid_;
  }
  document.querySelector(".ses2").innerHTML = sesid;
  document.querySelector("#sessionid").value = sesid;
  localStorage._sessionid_ = sesid;
}

let genID = function() {
  let chars = [];
  // for (let i = 65; i < 90; i++) {
  //   chars.push(String.fromCharCode(i));
  // }
  for (let i = 97; i < 122; i++) {
    chars.push(String.fromCharCode(i));
  }
  for (let i = 0; i < 9; i++) {
    chars.push(String(i));
  }
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor((Math.random() * chars.length))];
  }
  return code;
}


function create_app(isMaster) {
  return new Promise(function(resolve, reject) {
    if (localStorage.vizid === undefined)
      localStorage.vizid = (Math.random() * 1000000000).toFixed(0);

    let app = {};
    app.metronome_muted = true;
    app.to_playback = new TIMINGSRC.TimingObject();
    app.to_epoc = new TIMINGSRC.TimingObject();
    app.to_record = new TIMINGSRC.TimingObject();
    app.to_bpc = new TIMINGSRC.TimingObject();
    app.to_bpm = new TIMINGSRC.TimingObject();
    let to_limited = new TIMINGSRC.RangeConverter(app.to_playback, [0, 10000000]);
    app.sequencer = TIMINGSRC.Sequencer(to_limited);
    app.dcannon = new DataCannon("wss://audio.mcorp.no/dc/audio", [app.sequencer]);
    let join_timeout;

    app.updateSession = function() {
      return new Promise(function(resolve2, reject2) {
        let m = MCorp.app("8113568792798709392");
        m.ready.then(function() {
          m.getSession(function(res) {
            app.sid = res.sid;
            app.dcannon.post(localStorage._sessionid_, {
              id: "session",
              startts: 0,
              endts: 1000000000,
              name: "session",
              value: res.sid
            });
            console.log("Session posted for channel", localStorage._sessionid_);
            resolve2(m);
          });
        });
      });
    }

    if (document.querySelector(".mutemetronome input")) {
      document.querySelector(".mutemetronome input").addEventListener("change", function(evt) {
        if (evt.srcElement.checked) {
          app.metronome_muted = true;
        } else {
          app.metronome_muted = false;    
        }
      });
    }

    app.dcannon.ready.then(function() {
      join_timeout = setTimeout(function() {
        if (isMaster) {
          if (confirm("Session seems empty, create it?")) {
            app.updateSession();
            return;
          }
        }
        // TODO: Figure this out
        console.log("Failed, rejecting");
        reject("Empty session, please check it");
      }, 3000);

      document.querySelector("#sessionid").addEventListener("change", function(e) {
        console.log("Sesssion ID changed");
        if (localStorage._sessionid_) {
          // First unsub
          app.dcannon.unsubscribe(localStorage._sessionid_);
        }
        localStorage._sessionid_ = e.srcElement.value;
        app.dcannon.subscribe(localStorage._sessionid_);
      });
      if (localStorage._sessionid_)
        app.dcannon.subscribe(localStorage._sessionid_);

      if (isMaster) {
        resolve(app);
      }
    });

    let target = document.querySelector(".players");
    app.multiplayer = multiPlayer(target, app.sequencer, {
      epoc: app.to_epoc,
      record: app.to_record,
      playback: app.to_playback
    });

    app.to_bpc.on("change", function() {
      let bpc = Math.floor(this.pos);
      let bpc2 = Math.round((this.pos - bpc) * 10);
      if (document.querySelector("#bpc2")) {
        document.querySelector("#bpc").value = bpc;
        document.querySelector("#bpc2").value = bpc2;
      } else {
        document.querySelector("#bpc").innerHTML = bpc + "/" + bpc2;
      }
      console.log("Speeds changed");
      app.bpc = bpc;
    });
    app.to_bpm.on("change", function() {
      document.querySelector("#bpm").value = this.pos;
      document.querySelector("#bpm").innerHTML = this.pos;

      if (this.pos == 0) return;
      if (app._ticktock) app._ticktock.cancel();
      app._ticktock = TIMINGSRC.setIntervalCallback(app.to_playback, function() {
        // if (app.to_record.pos == 0) return;  
        // Let metronome play on playback too
        let beat_nr = Math.floor(app.to_playback.pos * (app.to_bpm.pos / 60.));
        document.querySelector("#rep").innerHTML = Math.floor(beat_nr / app.bpc) || 0;

        if (beat_nr < 0) beat_nr += 1000;
        document.querySelector("#beat").innerHTML = Math.floor(beat_nr % app.bpc) + 1 || 0;

        if (app.to_record.pos != 1) return;
        if (app.metronome_muted) return;
        if (Math.floor(beat_nr % app.bpc) == 0) {
          document.querySelector("#tick").play();
        } else {
          document.querySelector("#tock").play();
        }
      }, 60. / this.pos);
    });

    let setupTOs = function(mcorp) {
      app.to_playback.timingsrc = mcorp.motions.playback;
      app.to_epoc.timingsrc = mcorp.motions.epoc;
      app.to_record.timingsrc = mcorp.motions.record;
      app.to_bpm.timingsrc = mcorp.motions.bpm;
      app.to_bpc.timingsrc = mcorp.motions.bpc;
    }
    if (isMaster) {
      // I rule
      app.updateSession().then(function(mcorp) {
        mcorp.ready.then(function() {
          mcorp.motions.epoc.update(new Date() / 1000., 1);
          setupTOs(mcorp);
          app.updateSession();
          console.log("Setting time");
        });
      });
    }

    app.sequencer.on("change", function(e) {
      let item = e.data;
      if (item.name == "session" && !app.mcorp) {
        clearTimeout(join_timeout);
        if (!isMaster) {
          resolve(app);
          if (item.value == app.sid) return;
          app.sid = item.value;
          console.log("Got a SID, fixing mcorp app with session", item.value);
          mcorp = MCorp.app("8113568792798709392", {
            sessionid: item.value,
            anon: true
          });
          mcorp.ready.then(function() {
            setupTOs(mcorp);
            app.mcorp = mcorp;
            window.app = app;
          });
        }
      }
    });

    app.to_record.on("change", function() {
      console.log("app.to_record changed");
      if ($("#recordButton").length > 0) {
        recordButton();
      }
    });
  });
}