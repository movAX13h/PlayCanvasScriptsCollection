var AutoRotate = pc.createScript('autoRotate');

AutoRotate.attributes.add('speed', {
    type: 'number', 
    default: 1, 
    title: 'Rotation Speed', 
    description: 'Rotate around Y axis'
});

// initialize code called once per entity
AutoRotate.prototype.initialize = function() {

};

// update code called every frame
AutoRotate.prototype.update = function(dt) {
    this.entity.rotate(0, dt*this.speed, 0);
};
