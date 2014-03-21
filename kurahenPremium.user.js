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

	var customBBoardTitle = '/b/ - Random';
	var bbCodes = ['b', 'i', 'u', 's', 'small', 'code', 'spoiler'];
	var wordfilters = [
		['#nowocioty', 'STAROCIOTY PAMIĘTAJĄ'],
		['#gimbo', 'xD'],
		['#penis', 'pisiorek'],
		['#wagina', 'cipuszka'],
		['#m__b', 'groźny WYKOPEK wykryty'],
		['#Lasoupeauxchoux', 'kapuśniaczek'],
		['#homoś', 'pedał'],
		['#korwinkrulempolski', 'kongres nowej prawicy'],
		['#1%', 'groźny LEWAK wykryty']
	];

	var KurahenPremium = function () {
		var currentBoardName = this.getCurrentBoardName();
		if (currentBoardName === '') {
			return; // We are not on any useful page
		} else if (currentBoardName === 'b') {
			this.changeBoardTitle(customBBoardTitle);
		}
		this.updatePageTitle();
		this.setCookie('regulamin', 'accepted');
		this.changeFonts();
		this.insertButtonBar();
	};

	KurahenPremium.prototype.changeBoardTitle = function (newTitle) {
		document.title = newTitle;
		document.getElementsByClassName('boardTitle')[0].textContent = newTitle;
	};

	KurahenPremium.prototype.updatePageTitle = function () {
		var page = parseInt(window.location.pathname.split('/')[2]);
		var prefix = '';

		if (this.isCurrentWebpageThread()) {
			prefix = this.getTopicFromFirstPostContent();
		} else if (!isNaN(page)) {
			prefix = 'Strona ' + page;
		}

		if (prefix.length > 0) {
			prefix += ' - ';
		}

		document.title = prefix + document.title;
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

	KurahenPremium.prototype.getCurrentBoardName = function () {
		return window.location.pathname.split('/')[1];
	};

	KurahenPremium.prototype.isCurrentWebpageThread = function () {
		return window.location.pathname.split('/')[2] === 'res';
	};

	KurahenPremium.prototype.getTopicFromFirstPostContent = function () {
		var postContent = document.querySelector('.thread .postMessage').textContent;
		return postContent.substr(0, Math.min(postContent.length, 70)) + '...';
	};

	KurahenPremium.prototype.insertButtonBar = function () {
		var postForm = document.getElementById('postform');
		var textarea = document.querySelector("#postform textarea");
		var buttonBar = document.createElement('div');
		buttonBar.style.textAlign = 'center';

		this.insertTextFormattingButtons(textarea, buttonBar);
		this.insertWordfilterList(textarea, buttonBar);

		postForm.insertBefore(buttonBar, postForm.firstChild);
	};

	/**
	 * @private
	 */
	KurahenPremium.prototype.insertTextFormattingButtons = function (textarea, buttonBar) {
		var onButtonClick = function () {
			var startTag = '[' + this.value + ']';
			var endTag = '[/' + this.value + ']';

			var textBeforeSelection = textarea.value.substring(0, textarea.selectionStart);
			var selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
			var textAfterSelection = textarea.value.substring(textarea.selectionEnd, textarea.value.length);

			textarea.value = textBeforeSelection + startTag + selectedText + endTag + textAfterSelection;

			textarea.focus();
			textarea.selectionStart += startTag.length;
			textarea.selectionEnd = textarea.selectionStart + selectedText.length;
		};

		for (var i = 0; i < bbCodes.length; i++) {
			var button = document.createElement('input');
			button.type = 'button';
			button.value = bbCodes[i];
			button.addEventListener('click', onButtonClick, false);
			buttonBar.appendChild(button);
		}
	};

	/**
	 * @private
	 */
	KurahenPremium.prototype.insertWordfilterList = function (textarea, buttonBar) {
		var wordfiltersSelect = document.createElement('select');

		var defaultOption = document.createElement('option');
		defaultOption.value = '';
		defaultOption.disabled = true;
		defaultOption.selected = true;
		defaultOption.textContent = 'WORDFILTRY';
		wordfiltersSelect.appendChild(defaultOption);

		wordfiltersSelect.addEventListener('change', function () {
			//noinspection JSPotentiallyInvalidUsageOfThis
			var textToInsert = this.options[this.selectedIndex].value;
			var textBeforeEndOfSelection = textarea.value.substring(0, textarea.selectionEnd);
			var textAfterEndOfSelection = textarea.value.substring(textarea.selectionEnd, textarea.value.length);

			textarea.value = textBeforeEndOfSelection + textToInsert + textAfterEndOfSelection;

			textarea.focus();
			textarea.selectionStart = textBeforeEndOfSelection.length + textToInsert.length;
			textarea.selectionEnd = textarea.selectionStart;

			//noinspection JSPotentiallyInvalidUsageOfThis
			this.selectedIndex = 0;
		}, false);

		for (var j = 0; j < wordfilters.length; j++) {
			var option = document.createElement('option');
			option.value = wordfilters[j][0];
			option.textContent = wordfilters[j][1];
			wordfiltersSelect.appendChild(option);
		}

		buttonBar.appendChild(wordfiltersSelect);
	};

	// Initialize script
	window.KurahenPremium = new KurahenPremium();
})();
