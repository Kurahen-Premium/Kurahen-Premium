// ==UserScript==
// @name        Kurahen Premium
// @namespace   karachan.org
// @version     1.0
// @include     http://www.karachan.org/*
// @include     http://karachan.org/*
// @exclude     http://www.karachan.org/*/src/*
// @exclude     http://karachan.org/*/src/*
// ==/UserScript==

(function () {
	'use strict';

	var KurahenPremium = function () {
	};

	KurahenPremium.prototype.changeBoardTitle = function (newTitle) {
		document.title = newTitle;
		document.getElementsByClassName('boardTitle')[0].innerHTML = newTitle;
	};

	KurahenPremium.prototype.setCookie = function (name, value) {
		document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + '; path=/; max-age=2592000';
	};

	KurahenPremium.prototype.changeFonts = function () {
		var newLink = document.createElement('link');
		newLink.href = '//fonts.googleapis.com/css?family=Roboto:400,700&subset=latin,latin-ext';
		newLink.rel = 'stylesheet';
		var existingLink = document.getElementsByTagName('link')[0];
		existingLink.parentNode.insertBefore(newLink, existingLink);
		document.body.style.fontFamily = 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif';
	};

})();
