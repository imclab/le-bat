define([
	'eventEmitter',
	'utils'
],function(EventEmitter,Util){

	var toRad = Math.PI / 180;
	var toDeg = 180 / Math.PI;
	var earthRadius = 6371; // in km
	var maxDistance = 20038; // on earth in km

	function degToRad(deg){
		return deg * toRad;
	}

	function radToDeg(rad){
		return rad * toDeg;
	}

	function Locator(){
		EventEmitter.call(this);

		this.ready = false;

		this.options = {
			timeout : 5000
			, enableHighAccuracy : false
			, maximumAge : 30000
		} 

		this.init = function(){
			var self = this;
			navigator.geolocation.getCurrentPosition(function(pos){
				
				self.lat = degToRad(pos.coords.latitude);
				self.lon = degToRad(pos.coords.longitude);

				self.ready = true;
				self.emit('ready');
			},
			function(err){
				self.emit('error',err);
			},
			self.options);
		};

		this._calcDistance = function(lat,lon,dLon){

			// calculate the distance between the given point and the
			// coordinates of the locator using the Spherical Law of Cosines
			// Haversine could be another option but it seems like
			// the Spherical Law of Cosines is a bit better when it
			// comes to perfomance.
			// additional tests and infos can be found here:
			// http://jsperf.com/haversine-vs-spherical-law-of-cosines-vs-equirectangula
			// http://www.movable-type.co.uk/scripts/latlong.html

			return Math.acos(Math.sin(this.lat) * Math.sin(lat)
				+ Math.cos(this.lat) * Math.cos(lat)
                * Math.cos(dLon)) * earthRadius;
		};

		this._calcBearing = function(lat,lon,dLon){

			var y = Math.sin(dLon) * Math.cos(lat);
			var x = Math.cos(this.lat) * Math.sin(lat) 
					- Math.sin(this.lat) * Math.cos(lat) * Math.cos(dLon);

			var brng = Math.atan2(y, x);
			  
			// atan should be between -PI and PI
			// therefore bring it to a range between 0 and PI
			return brng + Math.PI;
		};

		this.geoPositionToCartesian = function(lat,lon){

			lat = degToRad(lat);
			lon = degToRad(lon);

			var dLon = lon - this.lon;
			var distance = this._calcDistance(lat,lon,dLon);
			var bearing = this._calcBearing(lat,lon,dLon);

			// calc x and y based on distance and angle
			// and bring them to a value between -1,1
			var x = distance * Math.cos(bearing) / maxDistance;
			var z = distance * Math.sin(bearing) / maxDistance;

			return {
				x : x
				, y : 0
				, z : z
			};
		}
	}

	// inherit from EventEmitter
	Util.inherits(Locator,EventEmitter);

	return Locator;

});
