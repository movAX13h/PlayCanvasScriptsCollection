var FollowOtherEntity = pc.createScript('followOtherEntity');

FollowOtherEntity.attributes.add('otherEntity', {
    title: 'Other entity',
    type: 'entity'
});

FollowOtherEntity.prototype.initialize = function() {
    this.update(0);
};

FollowOtherEntity.prototype.update = function(dt) {
    this.entity.setLocalPosition(this.otherEntity.getLocalPosition());
};