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

      /*
      document.querySelector("#sessionid").addEventListener("change", function(e) {
        console.log("Session ID changed");
        if (localStorage._sessionid_) {
          // First unsub
          app.dcannon.unsubscribe(localStorage._sessionid_);
        }
        localStorage._sessionid_ = e.srcElement.value;
        app.dcannon.subscribe(localStorage._sessionid_);
      });
     */
      if (localStorage._sessionid_) 
        app.dcannon.subscribe(localStorage._sessionid_);

      if (isMaster) {
        resolve(app);
      } else {
        updateProfile(false);
      }
    });

    let target = document.querySelector(".players");
    let options = {};
    if (isMaster) {
      options.onplayernew = function(player) {
        player.querySelector(".lock").addEventListener("click", function(evt) {
          evt.stopPropagation();
          let item = app.sequencer.getCue(player.getAttribute("key")).data;
          if (evt.srcElement.innerHTML == "lock_open") {
            let oldid = item.id;
            item.value.pinned = true;
            item.id = Math.floor(Math.random()* 100000000);
            evt.srcElement.innerHTML = "lock";
            // Remove the old item
            player.setAttribute("id", "player" + item.id);
            app.dcannon.remove(localStorage._sessionid_, oldid);

          } else {
            evt.srcElement.innerHTML = "lock_open";
            item.value.pinned = false;
          }
          app.dcannon.post(localStorage._sessionid_, {
            id: item.id,
            startts: item.startts,
            endts: item.endts,
            epoc: item.epoc,
            name: "profile",
            value: item.value
          });
        });
      }
    }
    app.multiplayer = multiPlayer(target, app.sequencer, {
      epoc: app.to_epoc,
      record: app.to_record,
      playback: app.to_playback
    }, options);

    app.to_bpc.on("change", function() {
      let bpc = Math.floor(this.pos);
      let bpc2 = Math.round((this.pos - bpc) * 10);
      if (document.querySelector("#bpc2")) {
        document.querySelector("#bpc").value = bpc;
        document.querySelector("#bpc2").value = bpc2;
      } else {
        document.querySelector("#bpc").innerHTML = bpc + "/" + bpc2;
      }
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
    let _last_url;
    let _last_offset;
    let updateProfile = function(mic, offset, url) {
      let name = "Host";
      if (!isMaster) {
        name = document.querySelector("#name").value;
      }
      let profile = {
        name: document.querySelector("#name").value,
        pic: "https://audio.mcorp.no/tux/Tux Avatar (" + localStorage.vizid % 945 + ").png",
        mic: true
      }
      if (url) {
        profile.offset = offset;
        profile.url = url;
        _last_url = url;
        _last_offset = offset;
      } else if (_last_url) {
        profile.offset = _last_offset;
        profile.url = _last_url;
      }
      console.log("Update profile", JSON.stringify(profile));
      app.dcannon.post(localStorage._sessionid_, {
        id: parseInt(localStorage.vizid),
        startts: 0,
        endts: 100000000,
        epoc: app.to_epoc.pos - 0.100 - app.calibrate,
        name: "profile",
        value: profile
      });          
    };

    let SERVER = "wss://audio.mcorp.no/ar/";

    var rec = false;
    document.querySelector("#checkDiv").addEventListener("click", function(e) {
      if (rec) {
        rec = false;
      } else {
        rec = true;
      }
      recordButton(rec);
      prettify();
      if (rec) {
        app.record();
      } else {
        app.stop_recording();
      }
    });

    app.to_record.on("change", function() {
      if ($("#recordButton").length > 0) {
        recordButton();
      }

      // auto-mute myself when we're recording
      if (rec) {
        if (this.pos != 0) {
          app.multiplayer.mutePlayer(localStorage.vizid);
        } else {
          app.multiplayer.unmutePlayer(localStorage.vizid);
        }        
      }
    });

    var Uploader = function(url, onError) {
      var API = {};
      var ws;
      var ts_sent = false;
      var resetting = false;
      var total_sent = 0;
      var recordedChunks = [];
      var metaChunks = [];
      var images = [];
      var statusTimeout;

      var connect = function() {
        if (ws) {
          //try {
          ws.close();
          //} catch (e) {
          //}
        }

        try {
          ws = new WebSocket(url);
          window.ws = ws;
          ws.binaryType = 'arraybuffer';
          console.log("Opening websocket");
          ws.onopen = function(event) {
            // Trigger metadata sending?
            console.log("WebSocket is open, ready to upload data");
            API.reset();
            document.querySelector("#status").innerHTML = "Idle";
            //set_record_btn_active(false);
            upload();
          };

          ws.onerror = function(event) {
            console.log("ERROR", event);
            ws.close();
            if (onError) {
              try {
                onError();
              } catch (err) {
                console.log("Error reporting error", err);
              }
            }
          };
          ws.onclose = function() {
            console.log("CLOSED");
            ws = undefined;
          };

        } catch (e) {
          console.log("Error connecting to server:", e);
          ws = undefined;
        }
      };

      var _send = function(data) {
        try {
          ws.send(data);
        } catch (err) {
          console.log("Error sending data");
          ws.onerror(err);
        }
      };
      var upload = function() {
        if (ws === undefined) {
          console.log("Upload requested, but not connected", window.ws);
          connect();
          return;
        }

        // Check ws state
        if (ws.readyState > 1) {
          connect();
          return;
        }
        if (ws.readyState == 0) {
          console.log("WS still connecting");
          return;
        }

        var dv;
        if (metaChunks.length > 0) {
          console.log("Have metachunk");
          // Meta-package
          var data = metaChunks.shift();

          var pkg = new ArrayBuffer(50);
          dv = new DataView(pkg);
          dv.setUint16(0, 0xf4db);
          dv.setUint32(2, parseInt(localStorage.vizid));
          dv.setFloat64(6, data.ts);

          if (data.position) {
            dv.setFloat64(14, data.position.coords.latitude);
            dv.setFloat64(22, data.position.coords.longitude);
            dv.setUint16(30, data.position.coords.altitude);
            dv.setUint16(32, data.position.coords.accuracy);
          }

          dv.setFloat64(34, data.heading || 0); // heading (0 degrees is north, 180 is south)
          dv.setFloat64(42, data.pitch || 0); // pitch (0 degrees is flat, 180 is up)
          _send(pkg);
          setTimeout(upload, 0);
        }

        if (recordedChunks.length > 0) {
          if (!resetting && ts_sent === false) {
            console.log("Sending TS message", recordedChunks[0][0]);
            ts_sent = true;
            // First data block, send the timestamp first
            var package = new ArrayBuffer(14);
            dv = new DataView(package);
            dv.setUint16(0, 0xf4de);
            dv.setUint32(2, parseInt(localStorage.vizid));
            dv.setFloat64(6, recordedChunks[0][0]);
            _send(package); //new Blob([dv]));
          }
          var chunk = recordedChunks.shift();
          if (chunk[0] === undefined) {
            clearTimeout(statusTimeout);
            document.querySelector("#status").innerHTML = "Idle";
            // set_record_btn_active(false);

            // Message already prepared (is likely END), just send it
            ws.send(chunk[1]);
            resetting = false;
          } else {
            var filereader = new FileReader();
            filereader.onload = function() {
              total_sent += this.result.byteLength;
              document.querySelector("#sent").innerHTML = (total_sent / 1024).toFixed(0);
              ws.send(this.result);
              setTimeout(upload, 0);
            };
            filereader.readAsArrayBuffer(chunk[1]);
          }
        }

        if (images.length > 0) {
          console.log("Will send image");
          var data = images.shift();
          var byteString = atob(data.image.split(',')[1]);
          var pkg = new ArrayBuffer(byteString.length + 14);
          dv = new DataView(pkg);
          dv.setUint16(0, 0xfbd);
          dv.setUint32(2, parseInt(localStorage.vizid));
          dv.setFloat64(6, data.ts);
          for (var j = 0; j < byteString.length; j++) {
            dv.setInt8(j + 14, byteString.charCodeAt(j));
          }
          _send(pkg);
          console.log("Image sent");
        }
      };
      var sendMeta = function(data) {
        if (!ws) {
          console.log("Skipping metadata, no connection");
        }
      };

      API.pushData = function(ts, data) {
        if (data === undefined) {
          throw new Error("Need data to send");
        }
        recordedChunks.push([ts, data]);
        var status = "Recording";
        if (recordedChunks.length > 4) {
          status = "NETWORK TOO SLOW";
        } else if (recordedChunks.length > 2) {
          status = "Network seems a bit slow";
        }
        clearTimeout(statusTimeout);
        document.querySelector("#status").innerHTML = status;
        //set_record_btn_active(true);
        statusTimeout = setTimeout(function() {
          document.querySelector("#status").innerHTML = "Stopped";
          //set_record_btn_active(false);
          console.log("No data in a bit");
          API.disconnect();
        }, 10000);
        setTimeout(upload, 0);
      };

      API.pushMeta = function(ts, position, heading, pitch) {
        var meta = {
          ts: ts,
          position: position,
          heading: heading,
          pitch: pitch
        };
        metaChunks.push(meta);
        setTimeout(upload, 0);
      };

      API.pushImage = function(ts, image) {
        images.push({
          ts: ts,
          image: image
        });
        setTimeout(upload, 0);
      };

      API.disconnect = function() {
        ws.close();
        ts_sent = false;
        ws = undefined;
      };

      // Should be called when a new recording is being made
      API.reset = function() {
        if (ts_sent === true) { // we've transmitted video, send end of video
          resetting = true;
          console.log("Sending END");
          var package = new ArrayBuffer(2);
          var dv = new DataView(package);
          dv.setUint16(0, 0xf4ff);
          API.pushData(undefined, package);
        }
        ts_sent = false;
      };
      connect();

      return API;
    };

    app.stop_recording = function() {
      app.disabled = true;
      app.uploader.reset();
      updateProfile(false);
    }

    app.record = function() {
      app.disabled = false;
      navigator.mediaDevices.getUserMedia({
          audio: true
        })
        .then(function(stream) {
          updateProfile(true);
          app.calibrate = 0.100;
          let options = {
            mimeType: 'audio/ogg; codecs=opus'
          };
          var mediaRecorder = new MediaRecorder(stream);
          window.mr = mediaRecorder;
          app.uploader = Uploader(SERVER);
          let running = false;
          app.to_record.on("change", function() {
            // If the record motion is running, we shold record!
            if (this.pos) { // We currently trigger on record - let this be a button
              if(mediaRecorder.state == "recording") {
                console.log("Record triggered while recording, ignore");
                return;
              }
              if (app.disabled) return;
              app.startTime = 0;
              running = true;
              console.log("Recording!");
              mediaRecorder.start(100);
            } else {
              // Done
              if (running && mediaRecorder.state == "recording") {
                mediaRecorder.stop();
                document.querySelector("#status").innerHTML = "Stopped";
              }
              setTimeout(function() {
                app.uploader.reset();
              }, 500);
            }
          });

          mediaRecorder.ondataavailable = function(e) {
            if (app.disabled && mediaRecorder.state == "recording") {
              mediaRecorder.stop();
              document.querySelector("#status").innerHTML = "Stopped";
              return;
            }
            if (!app.startTime) {
              // We request 100ms of data, so date it back
              // If we rather use app.motions.epoc.pos here we'll save all files
              let ts = app.to_playback.pos - 0.100 - app.calibrate;
              app.startTime = app.to_epoc.pos - 0.100 - app.calibrate;
              // We shold share this url within the group
              let url = "https://audio.mcorp.no/audio/" + parseInt(localStorage.vizid) + "_" + Math.floor(app.startTime);
              updateProfile(true, ts, url);
              /*
              let name = "Host";
              if (document.querySelector("#name")) {
                name = document.querySelector("#name").value;
              }
              let profile = {
                name: name,
                pic: "https://audio.mcorp.no/tux/Tux Avatar (" + localStorage.vizid % 945 + ").png",
                url: url,
                offset: ts,
                mic: true
              }
              // console.log("My profile is now:", profile);
              app.dcannon.post(localStorage._sessionid_, {
                id: parseInt(localStorage.vizid),
                startts: 0,
                endts: 100000000,
                epoc: app.to_epoc.pos - 0.100 - app.calibrate,
                name: "profile",
                value: profile
              });
              */
              app.uploader.pushData(app.startTime, e.data);
            } else {
              app.uploader.pushData(app.to_epoc.pos - 0.100 - app.calibrate, e.data);
            }
          };
        });
    };
  });
}