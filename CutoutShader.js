/*
    Spherical cutout at world position.
*/
var CutoutShader = pc.createScript('cutoutShader');
CutoutShader.attributes.add('materialAssets', {type: 'asset', assetType: 'material', array: true});
CutoutShader.attributes.add('cutoutPosition', {type: 'vec3' });
CutoutShader.attributes.add('radius', {type: 'number', min: 0.01, max: 15});
CutoutShader.attributes.add('feather', {type: 'number', min: 0.01, max: 5});

CutoutShader.prototype.initialize = function() {

    const opacityChunk = "uniform float material_opacity;\
        uniform vec3 uCutoutPosition;\
        uniform float uRadius;\
        uniform float uFeather;\
        \
        void getOpacity() {\
            dAlpha = smoothstep(uRadius, uRadius + uFeather, length(vPositionW-uCutoutPosition));\
            dAlpha *= material_opacity;\
        }";

    const renders = this.entity.findComponents('render');

    const modifyAndApplyMaterial = function(sourceMaterial)
    {
        const material = sourceMaterial.resource.clone();
        material.chunks.APIVersion = pc.CHUNKAPI_1_57;
        material.chunks.opacityPS = opacityChunk;
        material.update();

        // replace the model material that we are overriding        
        for (let i = 0; i < renders.length; ++i) {
            const meshInstances = renders[i].meshInstances;
            for (let j = 0; j < meshInstances.length; j++) {
                if (meshInstances[j].material === sourceMaterial.resource) {
                    meshInstances[j].material = material;
                }
            }
        }  
        return material;
    }

    this.materials = [];
    this.materialAssets.forEach(sourceMaterial => {
        this.materials.push(modifyAndApplyMaterial(sourceMaterial));
    });    

    this.on('destroy', () => {
        this.materials.forEach(material => {
            material.destroy();
        });
        this.materials = [];
    });
};

CutoutShader.prototype.update = function(dt) {
    var pos = new Float32Array([this.cutoutPosition.x, this.cutoutPosition.y, this.cutoutPosition.z]);
    this.materials.forEach(material => {
        material.setParameter('uCutoutPosition', pos);
        material.setParameter('uRadius', this.radius);
        material.setParameter('uFeather', this.feather);
    });
};
