function create_app(isMaster) {
  return new Promise(function(resolve, reject) {

      if (localStorage._sessionid_)
        document.querySelector("#sessionid").value = localStorage._sessionid_;

      if (localStorage.vizid === undefined)
        localStorage.vizid = (Math.random()*1000000000).toFixed(0);

      let app = {};
      app.to_playback = new TIMINGSRC.TimingObject();
      app.to_epoc = new TIMINGSRC.TimingObject();
      app.to_record = new TIMINGSRC.TimingObject();
      app.to_bpc = new TIMINGSRC.TimingObject();
      app.to_bpm = new TIMINGSRC.TimingObject();
      app.sequencer = TIMINGSRC.Sequencer(app.to_playback);
      app.dcannon = new DataCannon("wss://audio.mcorp.no/dc/audio", [app.sequencer]);
      let join_timeout;

      app.updateSession = function() {
        return new Promise(function(resolve, reject) {
          let m = MCorp.app("8113568792798709392");
          m.ready.then(function() {
            m.getSession(function(res) {
              console.log("Session posted")
              app.sid = res.sid;
              app.dcannon.post(localStorage._sessionid_, {id: "session", startts: 0, endts: 1000000000, name: "session", value: res.sid});
              resolve(m);
            });
          });
        });
      }

      app.dcannon.ready.then(function() {
        join_timeout = setTimeout(function() {
          if (confirm("Session seems empty, create it?")) {
            app.updateSession();
          }
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

        resolve(app);
      });

      let target = document.querySelector(".players");
      app.multiplayer = multiPlayer(target, app.sequencer, 
          {epoc: app.to_epoc,
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
            mcorp.motions.epoc.update(new Date()/1000.,1);
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
            if (item.value == app.sid) return;
            app.sid = item.value;
            console.log("Got a SID, fixing mcorp app with session", item.value);
            mcorp = MCorp.app("8113568792798709392", {sessionid: item.value, anon:true});
            mcorp.ready.then(function() {
              setupTOs(mcorp);              
            app.mcorp = mcorp;
            window.app = app;
            });
          }
        }
      });

      app.to_playback.on("change", function() {
        if (this.vel) {
          let draw_metronome = function() {
            // Repetitions is beats mod beats pr cycle
            let beat_nr = Math.floor(app.to_playback.pos * (app.to_bpm.pos / 60.));
            document.querySelector("#rep").innerHTML = Math.floor(beat_nr / app.bpc);
            document.querySelector("#beat").innerHTML = Math.floor(beat_nr % app.bpc) + 1;
            //#rep
            if (app.to_playback.vel)
              requestAnimationFrame(draw_metronome);
          }
          requestAnimationFrame(draw_metronome);
        }
      });

  });
}
