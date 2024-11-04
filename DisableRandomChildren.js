var DisableRandomChildren = pc.createScript('disableRandomChildren');

DisableRandomChildren.prototype.initialize = function() 
{
    for(var i = 0; i < this.entity.children.length; i++)
    {
        this.entity.children[i].enabled = Math.random() > 0.5;
    }
};
