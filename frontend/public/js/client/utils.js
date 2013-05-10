define([
],function(){
	return {
		inherits : function(child,parent){
    		child.super_ = parent;
    		child.prototype = Object.create(parent.prototype,{
        		constructor: {
            		value: child,
            		enumerable: false,
            		writable: true,
            		configurable: true
        		}
        	});
		}
	};
});