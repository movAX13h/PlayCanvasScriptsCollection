var UserRotate = pc.createScript('userRotate');

UserRotate.attributes.add('cameraEntity', {type: 'entity', title: 'Camera Entity'});

UserRotate.attributes.add('orbitSensitivity', {
    type: 'number', 
    default: 0.1, 
    title: 'Orbit Sensitivity', 
    description: 'How fast the object rotates. Higher is faster'
});

UserRotate.attributes.add('rotationDamping', {
    type: 'number', 
    default: 0.6, 
    title: 'Rotation damping'
});

UserRotate.prototype.initialize = function() {

    this.lastTouchPoint = new pc.Vec2();
    this.isTouchRotating = false;

    this.dx = 0;
    this.dy = 0;
    this.lastInteractionTime = -10;
    this.time = 0;
    this.dt = 0;

    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        
    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);        
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
    }
    
    this.on('destroy', function () {
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);

        if (this.app.touch) {
            this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
            this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
            this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        }
    }, this);

};

UserRotate.prototype.update = function(dt) {
    
    this.dt = dt;
    this.time += dt;

    // slow auto-rotation
    const targetX = this.time - this.lastInteractionTime > 4 ? -dt : 0;

    // damp rotation
    const damp = 1 - Math.exp(-this.rotationDamping * dt);
    this.dx += (targetX - this.dx) * damp;
    this.dy += -this.dy * damp;

    this.rotate(this.dx, this.dy);
};

UserRotate.horizontalQuat = new pc.Quat();
UserRotate.verticalQuat = new pc.Quat();
UserRotate.resultQuat = new pc.Quat();

UserRotate.prototype.rotate = function (dx, dy) {
    var horzQuat = UserRotate.horizontalQuat;
    var vertQuat = UserRotate.verticalQuat;
    var resultQuat = UserRotate.resultQuat;

    // Create a rotation around the camera's orientation in order for them to be in screen space  
    horzQuat.setFromAxisAngle(this.cameraEntity.up, dx);
    vertQuat.setFromAxisAngle(this.cameraEntity.right, dy);

    // Apply both the rotations to the existing entity rotation
    resultQuat.mul2(horzQuat, vertQuat);
    resultQuat.mul(this.entity.getRotation());

    this.entity.setRotation(resultQuat);    
};

UserRotate.prototype.onTouchStart = function (event) {
    var touch = event.touches[0];
    this.isTouchRotating = false;
    this.lastTouchPoint.set(touch.x, touch.y);
};

UserRotate.prototype.onTouchMove = function (event) {
    var touch = event.touches[0];
    var dx = touch.x - this.lastTouchPoint.x;
    var dy = touch.y - this.lastTouchPoint.y;
    
    this.dx += dx * this.orbitSensitivity * this.dt;
    this.dy += dy * this.orbitSensitivity * this.dt;
    
    this.isTouchRotating = true;
    this.lastTouchPoint.set(touch.x, touch.y);
    this.lastInteractionTime = this.time;
};

UserRotate.prototype.onTouchEnd = function(event) {
    if (this.isTouchRotating) event.event.preventDefault();
    this.isTouchRotating = false;
};

UserRotate.prototype.onMouseMove = function (event) {    
    var mouse = this.app.mouse;
    if (mouse.isPressed(pc.MOUSEBUTTON_LEFT)) 
    {
        this.lastInteractionTime = this.time;
        this.dx += event.dx * this.orbitSensitivity * this.dt;
        this.dy += event.dy * this.orbitSensitivity * this.dt;
    }

    // disable tile picking while rotating
    //if (mouse.isPressed(pc.MOUSEBUTTON_LEFT) || mouse.wasPressed(pc.MOUSEBUTTON_LEFT)) this.app.fire("shapepicker:disable");
    //else this.app.fire("shapepicker:enable");
};
