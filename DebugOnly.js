var DebugOnly = pc.createScript('debugOnly');

DebugOnly.prototype.initialize = function() {
    // enable entity only if we are working in the PlayCanvas Launch environment
    this.entity.enabled = document.location.href.includes("launch.play");
};