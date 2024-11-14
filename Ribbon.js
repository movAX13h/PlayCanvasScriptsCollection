// based on engine example: https://developer.playcanvas.com/tutorials/rainbow-trail-with-mesh-api/

var Ribbon = pc.createScript('ribbon');

Ribbon.attributes.add("lifetime", {type:"number", default:0.5});
Ribbon.attributes.add("xoffset", {type:"number", default:-0.8, title: "Offset A"});
Ribbon.attributes.add("yoffset", {type:"number", default:1, title: "Offset B"});
Ribbon.attributes.add("height", {type:"number", default:0.4});

var MAX_VERTICES = 600;
var VERTEX_SIZE = 4;

Ribbon.prototype.initialize = function () {
    var shaderDefinition = {
        attributes: {
            aPositionAge: pc.SEMANTIC_POSITION
        },
        vshader: `
            attribute vec4 aPositionAge;
            
            uniform mat4 matrix_viewProjection;
            uniform float trail_time;
            
            varying float vAge;
            
            void main(void)
            {
                vAge = trail_time - aPositionAge.w;
                gl_Position = matrix_viewProjection * vec4(aPositionAge.xyz, 1.0);
            }`,
        fshader: `
            precision mediump float;            
            varying float vAge;            
            uniform float trail_lifetime;
            
            vec3 fx(float x)
            {
                return vec3(1.0, 0.0, 0.0);
                /*
                float level = floor(x * 6.0);
                float r = float(level <= 2.0) + float(level > 4.0) * 0.5;
                float g = max(1.0 - abs(level - 2.0) * 0.5, 0.0);
                float b = (1.0 - (level - 4.0) * 0.5) * float(level >= 4.0);
                return vec3(r, g, b);
                */
            }

            void main(void)
            {
                float progress = vAge / trail_lifetime;
                gl_FragColor = vec4(fx(progress), (1.0 - progress) * 0.5);
            }`
    };
    
    var shader = new pc.Shader(this.app.graphicsDevice, shaderDefinition);

    this.material = new pc.Material();
    this.material.shader = shader;
    this.material.setParameter('trail_time', 0);
    this.material.setParameter('trail_lifetime', this.lifetime);
    this.material.cull = pc.CULLFACE_NONE;
    this.material.blendState = pc.BlendState.ALPHABLEND;
    this.material.depthWrite = false;

    this.timer = 0;
    this.active = false;
    this.app.on('ribbon:start', () => { this.active = true; }, this);
    this.app.on('ribbon:stop', () => { this.active = false; }, this);

    // the generated ribbon vertices data
    this.vertices = [];

    // vertex array to use with Mesh API and update the mesh
    this.vertexData = new Float32Array(MAX_VERTICES * VERTEX_SIZE);
    
    // create the array for the vertex positions
    this.vertexIndexArray = [];
    for (var i = 0; i < this.vertexData.length; ++i) {
        this.vertexIndexArray.push(i);
    }
    
    // prepare the mesh to be created into a mesh instance
    this.mesh = new pc.Mesh(this.app.graphicsDevice);
    this.mesh.clear(true, false);
    this.mesh.setPositions(this.vertexData, VERTEX_SIZE, MAX_VERTICES);
    this.mesh.setIndices(this.vertexIndexArray, MAX_VERTICES);
    this.mesh.update(pc.PRIMITIVE_TRISTRIP);

    // create the mesh instance
    this.meshInstance = new pc.MeshInstance(this.mesh, this.material);
    
    // big aabb to avoid frustum culling; might need adjustment
    this.aabb = new pc.BoundingBox(new pc.Vec3(0, 0, 0), new pc.Vec3(20, 20, 20));

    this.entity.addComponent('render', {
        meshInstances: [this.meshInstance],
        layers: [this.app.scene.layers.getLayerByName('Ball').id]
    });

    this.entity.render.castShadows = false;
    this.entity.render.receiveShadows = false;
    this.entity.render.enabled = false;
};

Ribbon.prototype.reset = function () {
    this.timer = 0;
    this.vertices = [];
};

Ribbon.prototype.spawnNewVertices = function () {
    var node = this.entity;
    var pos = node.getPosition();
    var yaxis = node.up.clone().scale(this.height);

    var s = this.xoffset;
    var e = this.yoffset;
    
    var spawnTime = this.timer;
    var vertexPair = [
        pos.x + yaxis.x * s, pos.y + yaxis.y * s, pos.z + yaxis.z * s, 
        pos.x + yaxis.x * e, pos.y + yaxis.y * e, pos.z + yaxis.z * e
    ];
    
    this.vertices.unshift({ spawnTime, vertexPair });
};

Ribbon.prototype.clearOldVertices = function () {
    for (var i = this.vertices.length - 1; i >= 0; i--) {
        var vp = this.vertices[i];
        if (this.timer - vp.spawnTime >= this.lifetime) {
            this.vertices.pop();
        } else {
            break;
        }
    }
};

Ribbon.prototype.prepareVertexData = function () {
    for (var i = 0; i < this.vertices.length; i++) {
        var vp = this.vertices[i];
        
        this.vertexData[i * 8 + 0] = vp.vertexPair[0];
        this.vertexData[i * 8 + 1] = vp.vertexPair[1];
        this.vertexData[i * 8 + 2] = vp.vertexPair[2];
        this.vertexData[i * 8 + 3] = vp.spawnTime;

        this.vertexData[i * 8 + 4] = vp.vertexPair[3];
        this.vertexData[i * 8 + 5] = vp.vertexPair[4];
        this.vertexData[i * 8 + 6] = vp.vertexPair[5];
        this.vertexData[i * 8 + 7] = vp.spawnTime;
        
        if (this.vertexData.length === i) {
            break;
        }
    }
};

Ribbon.prototype.update = function (dt) {
    this.timer += dt;
    this.material.setParameter('trail_time', this.timer);
    
    // remove any old vertices at the end of the trail based on the timer value
    this.clearOldVertices();
    
    // create new vertices on the updated position of the beginning of the trail
    if (this.active) this.spawnNewVertices();
    
    // update the mesh
    if (this.vertices.length > 1) 
    {
        this.prepareVertexData();
        var currentLength = this.vertices.length * 2;
        var limit = Math.min(currentLength, MAX_VERTICES);
        
        this.mesh.setPositions(this.vertexData, VERTEX_SIZE, limit);
        this.mesh.setIndices(this.vertexIndexArray, limit);
        this.mesh.update(pc.PRIMITIVE_TRISTRIP);
        this.meshInstance.setCustomAabb(this.aabb); // set aabb to avoid frustum culling
        this.entity.render.enabled = true;
    }
    else this.entity.render.enabled = false;
};
