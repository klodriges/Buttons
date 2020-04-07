var DataCannon = class  {

  constructor(server, sequencers, onError) {
    this.onerror = onError;
    this.ws = new WebSocket(server);
    this.ws.binaryType = 'arraybuffer';
    this.sequencers = sequencers;
    this.decoder = new TextDecoder();
    let t = this;
    this.channels = [];
    let reconn_timeout = undefined;
    this.ready = new Promise(function(resolve, reject) {
      let ping_timer;
      let initial = true;
      let setup = function() {
        t.ws.onmessage = function(e) {
          try {
            let msgs = (typeof e.data === 'string' || e.data instanceof String) ? JSON.parse(e.data) : JSON.parse(t.decoder.decode(e.data));
            if (msgs.type === "pong") return;
            if (msgs.ERROR) {
              if (t.onerror)
                t.onerror(msgs);
            }
            for (var i=0; i<msgs.length; i++) {
              let msg = msgs[i];
              if (msg.value) msg.value = JSON.parse(msg.value);
              if (msg.remove) {
                for (let s=0; s<sequencers.length; s++) {
                  sequencers[s].removeCue(String(msg.remove));
                }
                continue;
              }
              if (msg.clear) {
                console.log("Channel cleared", msg.clear);
                // A whole channel has been cleared
                for (let s=0; s<sequencers.length; s++) {
                  let s = sequencers[i];
                  let cues = s.getCues();
                  for (let j=0; j<cues.length; j++) {
                    console.log("Checking if", cues[j], "is in channel", msg.clear);
                    if (cues[j].data.channel === msg.clear) {
                      s.removeCue(cues[j].key);
                    }
                  }
                }
                continue;              
              }
              let endts = msg.endts || msg.startts;
              for (let s=0; s<sequencers.length; s++) {
                if (sequencers[s].filter) {
                  if (sequencers[s].filter(msg)) {
                    if (sequencers[s].convert) {
                      sequencers[s].addCue(String(msg.id), new TIMINGSRC.Interval(msg.startts, endts), 
                          sequencers[s].convert(msg));
                    } else {
                      sequencers[s].addCue(String(msg.id), new TIMINGSRC.Interval(msg.startts, endts), msg);
                    }
                  }
                } else {
                    if (sequencers[s].convert) {
                      sequencers[s].addCue(String(msg.id), new TIMINGSRC.Interval(msg.startts, endts), 
                          sequencers[s].convert(msg));
                    } else {
                      sequencers[s].addCue(String(msg.id), new TIMINGSRC.Interval(msg.startts, endts), msg);
                    }
                }
              }
            }
          } catch (err) {
            console.log("Bad message", err);
          }
        } 
        t.ws.onclose = function(e) {
          console.log("Error or disconnect", e);
          // Try to reconnect
          clearTimeout(reconn_timeout);
          clearInterval(ping_timer);
          ping_timer = null;
          reconn_timeout = setTimeout(function() {
            console.log(new Date(), "Reconnecting...");
            t.ws = new WebSocket(server);
            t.ws.binaryType = 'arraybuffer';
            setup();
          }, 5000);
          t.ws.close();
        }
        //t.ws.onclose = t.ws.onerror;
        t.ws.onopen = function() {
          console.log(new Date(), "Connected");

          for (let i=0; i<t.channels.length; i++) 
            t.subscribe(t.channels[i], true);

          if (initial) {
            resolve();
            initial = false;
          }
          clearInterval(ping_timer);
          ping_timer = setInterval(function() {
            t.ws.send(JSON.stringify({type: "ping"}));
          }, 5000);
        }
      };

      setup();
    });
  }
  subscribe(channel, reconnect) {
    if (!reconnect)
      this.channels.push(channel);
    if (this.ws.readyState == 0) {
      console.log("Subscribe on unconnected channel, will subscribe when connected");
      return;
    }
    this.ws.send(JSON.stringify({type: "sub", channel: channel}));
    console.log("Subscribed to channel", channel);
  } 

  unsubscribe(channel) {
    let i = this.channels.indexOf(channel);
    if (i == -1) {
      throw new Error("Not subscribed to " + channel);
    }
    this.channels.splice(i, 1);
    this.ws.send(JSON.stringify({type: "unsub", channel: channel}));

    for (let x=0; x<this.sequencers.length; x++) {
      let items = this.sequencers[x].getCues();
      for (let i=0; i<items.length; i++) {
        if (items[i].data.channel === channel) {
          this.sequencers[x].removeCue(String(items[i].data.id));
        }
      }
    }
    console.log("Unsubscribed from channel", channel);
  }

  post(channel, item, func) {
    if (this.channels.indexOf(channel) == -1) {
      throw new Error("Can't post to channel without being subscribed");
    }
    item.value = JSON.stringify(item.value, func);
    this.ws.send(JSON.stringify({channel: channel, type: "post", item:item}, func));
  }

  remove(channel, itemid) {
    if (this.channels.indexOf(channel) == -1) {
      throw new Error("Can't delete from channel without being subscribed");
    }
    this.ws.send(JSON.stringify({channel: channel, type: "remove", id: itemid}));
  }

  clear(channel) {
    if (this.channels.indexOf(channel) == -1) {
      throw new Error("Can't clear channel without being subscribed");
    }
    this.ws.send(JSON.stringify({channel: channel, type: "clear"}));
  }
}
