console.log("MAIN is running", MCorp);

var _mcorpapp;

/*chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.session) {
      start_app(request);
      sendResponse({response: "ok"});
    }
  });
*/
let _syncplugin_start_app = function(options) {
  let sessionid = getParameterByName("sid");
  console.log("Content started by mcorp sync plugin, sid", sessionid);
  _mcorpapp = MCorp.app("4329613155765215359", {anon:true, sessionid:sessionid});
  _mcorpapp.ready.then(function() {
  	let motion = _mcorpapp.motions.private;
  	console.log("APP is ready", motion);
    let i = setInterval(function() {
      let found = false;
    	document.querySelectorAll("video").forEach(function(vid) {
        found = true;        
        vid.addEventListener("durationchange", function() {
          if (Math.abs(vid.duration - _mcorpapp.motions.duration.pos) > 1) {
            _mcorpapp.motions.duration.update(vid.duration);
          }
        });
        if (vid.duration && Math.abs(vid.duration - _mcorpapp.motions.duration.pos) > 1) {
          _mcorpapp.motions.duration.update(vid.duration);
        }
        console.log("Found video element", vid, vid.readyState, vid.duration);
        //vid.addEventListener("playing", function() {
      		_mcorpapp.sync = MCorp.mediaSync(vid, motion);          
        //});
    	});

      document.querySelectorAll("audio").forEach(function(vid) {
        found = true;
        //vid.addEventListener("playing", function() {
          _mcorpapp.sync = MCorp.mediaSync(vid, motion);
        //});
      });
      if (found)
        clearInterval(i);
    });
  });
}

function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

if (getParameterByName("_mcrpits_")) _syncplugin_start_app();

//console.log("SENDING MESSAGE");
//chrome.runtime.sendMessage({"ready": true});
