var Billboard = pc.createScript('billboard');

Billboard.prototype.initialize = function() {
    this.camera = this.app.root.findByName('Camera');
};

Billboard.prototype.update = function(dt) {
    this.entity.setRotation(this.camera.getRotation());
};