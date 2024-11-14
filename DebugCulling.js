var DebugCulling = pc.createScript('debugCulling');

DebugCulling.attributes.add('layerName', {
    type: 'string', 
    default: 'World', 
    title: 'Layer name'
});

DebugCulling.prototype.initialize = function() {

    //console.log(this.app.scene.layers);
    const myLayer = this.app.scene.layers.getLayerByName(this.layerName);

    myLayer.onPostCull = function(cameraIndex) {
        const meshInstances = myLayer.meshInstances;
        
        for (let i = 0; i < meshInstances.length; i++) {
            const meshInstance = meshInstances[i];
            
            //console.log(meshInstance.aabb);

            if (meshInstance.visibleThisFrame) {
                console.log("MeshInstance is visible this frame:", meshInstance);
            } else {
                console.log("MeshInstance is NOT visible this frame:", meshInstance);
            }
        }
    };
};
