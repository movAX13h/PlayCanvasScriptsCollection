// fire an event when a button is pressed
// put this on an entity with a button component

var ButtonFireEvent = pc.createScript('buttonFireEvent');

ButtonFireEvent.attributes.add('eventName', {
    type: 'string',
    description: 'The event fired when button is pressed'
});

ButtonFireEvent.prototype.initialize = function() {
    this.entity.button.on('click', function(event) {
        this.app.fire(this.eventName);
    }, this);
};