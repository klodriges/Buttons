console.log("MCRP ITST");
// We first pause all videos just in case
/*
setTimeout(function() {
  document.querySelectorAll("video").forEach(function(vid) {
    vid.pause();
  });  
}, 100);
*/

var _smcorp = document.createElement("script");
_smcorp.src = chrome.runtime.getURL("js/mcorp-2.0.js");
console.log("URL is", _smcorp.src);
(document.head || document.documentElement).appendChild(_smcorp);

var _ssync = document.createElement("script");
_ssync.src = chrome.runtime.getURL("js/mediasync.js");
document.body.appendChild(_ssync);    

_ssync.onload = function() {
	let _main = document.createElement("script");
	_main.src = chrome.runtime.getURL("js/main.js");
	(document.head || document.documentElement).appendChild(_main);
}
