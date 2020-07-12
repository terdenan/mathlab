window.amplitude = {
	getInstance: function() {
		return {
			logEvent: function(name, properties) {
				console.log('[DEV] Event name: ' + name);
				console.log('[DEV] Event properties: ' + properties);
			},
			setUserProperties: function (properties) {
				console.log('[DEV] Event user properties: ' + properties);
			}
		}
	}
}