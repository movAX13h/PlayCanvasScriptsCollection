var ShapePicker = pc.createScript('shapePicker');
ShapePicker.attributes.add("cameraEntity", {type: "entity", title: "Camera Entity"});

ShapePicker.prototype.initialize = function() 
{
    this.pickerEnabled = true;
    this.ray = new pc.Ray();
    
    this.pickableEntities = [];
    this.pickableShapes = [];
    this.hitPosition = new pc.Vec3();
    
    this.started = false;

    this.app.on("shapepicker:add", this.addItem, this);
    this.app.on("shapepicker:remove", this.removeItem, this);

    this.app.on("shapepicker:enable", this.enablePicker, this);
    this.app.on("shapepicker:disable", this.disablePicker, this);    

    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseDown, this);    
    if (this.app.touch) this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchStart, this);

    this.on('destroy', function() {
        this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseDown, this);
        if (this.app.touch) this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchStart, this);
    }, this);
};

ShapePicker.prototype.start = function()
{
    this.started = true;
};

ShapePicker.prototype.enablePicker = function () 
{
    this.pickerEnabled = true;
};

ShapePicker.prototype.disablePicker = function () 
{
    this.pickerEnabled = false;
};

ShapePicker.prototype.doRayCast = function (screenPosition) 
{
    // Initialise the ray and work out the direction of the ray from the screen position
    this.cameraEntity.camera.screenToWorld(screenPosition.x, screenPosition.y, this.cameraEntity.camera.farClip, this.ray.direction); 
    this.ray.origin.copy(this.cameraEntity.getPosition());
    this.ray.direction.sub(this.ray.origin).normalize();
    
    // Test the ray against all the objects registered to this picker
    var closest = -1;
    var closestHitPos = new pc.Vec3(0);
    var minDist = 1e6;
    for (var i = 0; i < this.pickableShapes.length; ++i) 
    {
        if (!this.pickableEntities[i].enabled) continue;

        var pickableShape = this.pickableShapes[i];
        var result = pickableShape.intersectsRay(this.ray, this.hitPosition);
        
        if (result) 
        {
            const dist = this.cameraEntity.getPosition().distance(this.hitPosition);
            if (dist < minDist)
            {
                minDist = dist;
                closest = i;
                closestHitPos.copy(this.hitPosition);
            }
        }
    }

    if (closest > -1) this.app.fire("shapepicker:hit", this.pickableEntities[closest], minDist);
};

ShapePicker.prototype.onMouseDown = function(event) {
    if (!this.started) return;
    if (!this.pickerEnabled) return;
    if (event.button == pc.MOUSEBUTTON_LEFT) {
        this.doRayCast(event);
    }
};

ShapePicker.prototype.onTouchStart = function (event) {
    if (!this.started) return;
    if (!this.pickerEnabled) return;
    // On perform the raycast logic if the user has one finger on the screen
    if (event.touches.length == 1) {
        this.doRayCast(event.touches[0]);
        
        // Android registers the first touch as a mouse event so it is possible for 
        // the touch event and mouse event to be triggered at the same time
        // Doing the following line will prevent the mouse down event from triggering
        event.event.preventDefault();
    }    
};

ShapePicker.prototype.addItem = function (entity, shape) {
    if (entity) {
        this.pickableEntities.push(entity);
        this.pickableShapes.push(shape);
    }
};
        
ShapePicker.prototype.removeItem = function (entity) {
    var i = this._items.indexOf(entity);
    if (i >= 0) {
        this.pickableEntities.splice(i, 1);
        this.pickableShapes.splice(i, 1);
    }
};