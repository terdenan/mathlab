'use strict';

function sendEvent(element) {
	const eventName = element.dataset.eventName;
	const eventProperties = (element.dataset.eventProperties !== undefined) ? JSON.parse(element.dataset.eventProperties) : null;
	const eventUserProperties = (element.dataset.eventUserProperties !== undefined) ? JSON.parse(element.dataset.eventUserProperties) : null;

	if (eventName) {
		amplitude.getInstance().logEvent(eventName, eventProperties);
	}

	if (eventUserProperties) {
		amplitude.getInstance().setUserProperties(eventUserProperties);
	}
}
