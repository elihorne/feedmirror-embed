/* eslint-disabled */
/* eslint-env node */
/* eslint-env browser */
"use strict";

module.exports = function feedmirror(fmSettings) {
  (function (d, s, id) {
    var fmLocalURL =
      "https://" +
      window.location.host +
      "/embed/" +
      fmSettings.version +
      "/embed.js";
    var fmProdURL =
      "https://data.feedmirror.com/embed/" +
      fmSettings.version +
      "/embed.min.js";
    var fmDataURL = fmProdURL;
    if (fmSettings.local == true) {
      fmDataURL = fmLocalURL;
    }
    var js,
      fmjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.onload = function () {
      // remote script has loaded

      if (fmSettings.version >= "1") {
        feedMirrorEmbed.init(fmSettings);
      }
    };
    js.src = fmDataURL;
    fmjs.parentNode.insertBefore(js, fmjs);
  })(document, "script", "feedmirror-jsembed");
};
