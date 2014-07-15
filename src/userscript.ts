var main = function () {
	new KurahenPremium();
};

if (navigator.userAgent.toLowerCase().indexOf('chrome/') > -1) {
	// Chrome/Chromium/Opera Next
	main();
} else {
	// Firefox and others
	window.addEventListener('DOMContentLoaded', main);
}
