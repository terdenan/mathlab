'use strict';

const USER_PROPERTIES_COOKIE = 'user_properties';
const USER_PROPERTIES_IS_SENT_COOKIE = '_a_is_sent';
const SESSION_EVENT_IS_SENT_COOKIE = '_a_session_is_sent';

function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));

  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options) {
	if (!options) {
		options = {};
	}

	options.path || (options.path = '/');

	if (options.expires instanceof Date) {
		options.expires = options.expires.toUTCString();
	}

  	let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

	for (let optionKey in options) {
		updatedCookie += "; " + optionKey;

		let optionValue = options[optionKey];

		if (optionValue !== true) {
			updatedCookie += "=" + optionValue;
		}
	}

	document.cookie = updatedCookie;
}

(function setUserProperties() {
	const sessionEventIsSentCookie = getCookie(SESSION_EVENT_IS_SENT_COOKIE);
	const userPropertiesCookie = getCookie(USER_PROPERTIES_COOKIE);
	const isUserPropertiesSent = getCookie(USER_PROPERTIES_IS_SENT_COOKIE);

	if (userPropertiesCookie && !isUserPropertiesSent) {
		const userProperties = JSON.parse(userPropertiesCookie);
		const userId = userProperties['email'];

		delete userProperties.email;

		amplitude.getInstance().setUserId(userId);
		amplitude.getInstance().setUserProperties(userProperties);

		const cookieExpirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

		setCookie(USER_PROPERTIES_IS_SENT_COOKIE, 1, {
			expires: cookieExpirationDate.toUTCString(),
		});
	}

	if (userPropertiesCookie && !sessionEventIsSentCookie) {
		amplitude.getInstance().logEvent('Session start');

		setCookie(SESSION_EVENT_IS_SENT_COOKIE, 1);
	}
}());

function sendEvent(element) {
	const eventName = element.dataset.eventName;
	const eventProperties = (element.dataset.eventProperties !== undefined) ? JSON.parse(element.dataset.eventProperties) : null;
	const eventUserProperties = (element.dataset.eventUserProperties !== undefined) ? JSON.parse(element.dataset.eventUserProperties) : null;

	if (eventName) {
		amplitude.getInstance().logEvent(eventName, eventProperties);
	}
}