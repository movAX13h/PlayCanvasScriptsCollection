/*
    Usage: 
    - attach this script to an entity with a render component and a material
    - upload a webm video file with transparency to the PlayCanvas editor and assign it to the videoFile attribute
*/

var TransparentVideoTexture = pc.createScript('transparentvideotexture');

TransparentVideoTexture.attributes.add('videoFile', {title: 'transparent video', type: 'asset', assetType: 'binary'});

TransparentVideoTexture.prototype.initialize = function() {

    this.videoTexture = null;

    this.videoElement = document.createElement('video');
    this.videoElement.autoplay = true;
    this.videoElement.loop = true;
    this.videoElement.muted = true;
    this.videoElement.playsInline = true;
    this.videoElement.crossOrigin = "anonymous";
    this.videoElement.addEventListener('canplaythrough', this.setupMaterial.bind(this), false);
    this.videoElement.src = this.videoFile.getFileUrl();
    this.videoElement.load();

    this.videoElement.style.position = 'absolute';
    this.videoElement.style.zIndex = "-1000";
    this.videoElement.style.width = "1px";
    this.videoElement.style.height = "1px";
    document.body.appendChild(this.videoElement);
};

TransparentVideoTexture.prototype.setupMaterial = function() {

    console.log("setup material");

    this.videoTexture = new pc.Texture(this.app.graphicsDevice, {
        format: pc.PIXELFORMAT_RGBA32F,
        minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
        magFilter: pc.FILTER_LINEAR,
        addressU: pc.ADDRESS_CLAMP_TO_EDGE,
        addressV: pc.ADDRESS_CLAMP_TO_EDGE,
        mipmaps: true
    });

    this.videoTexture.setSource(this.videoElement);

    const render = this.entity.findComponent('render');
    if (render)
    {
        if (render.meshInstances.length > 0)
        {
            const material = render.meshInstances[0].material;
            if (material)
            {
                material.emissiveMap = this.videoTexture;
                material.opacityMap = this.videoTexture;
                material.blendType = pc.BLEND_NORMAL;
                material.opacityMapChannel = "a";
                material.update();

                this.videoElement.play();
            }
            else console.error("TransparentVideoTexture entity has no material");
        }
        else console.error("TransparentVideoTexture entity has no mesh instance");
    }
    else console.error("TransparentVideoTexture entity has no render component");
};

TransparentVideoTexture.prototype.update = function(dt) {
    if (this.videoTexture != null) this.videoTexture.upload();
};
