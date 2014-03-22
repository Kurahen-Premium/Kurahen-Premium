// ==UserScript==
// @name        Kurahen Premium
// @namespace   karachan.org
// @description Zestaw dodatkowych opcji dla forum młodzieżowo-katolickiego
// @version     1.0
// @include     http://www.karachan.org/*
// @include     http://karachan.org/*
// @exclude     http://www.karachan.org/*/src/*
// @exclude     http://karachan.org/*/src/*
// ==/UserScript==

(function () {
	'use strict';

	// Konfiguracja
	var customBBoardTitle = '/b/ - Random';
	var enableBetterFonts = true; // Podmienia domyślne czcionki na Roboto

	// Zaawansowana konfiguracja
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
	var boardsWithId = ['b', 'fz', 'z'];
	var colors = [
		'#FF8080',
		'#FFDD80',
		'#80FFB7',
		'#80D0FF',
		'#C680FF',
		'#FFAE80',
		'#D5FF80',
		'#80FFFD',
		'#8097FF',
		'#FF80CA',
		"#ff7f7f",
		"#779aef",
		"#b0de6f",
		"#cc66c0",
		"#5cb9a9",
		"#f3bb79",
		"#8d71e2",
		"#6dd168",
		"#be5f7e",
		"#7bc8f6"
	];

	var KurahenPremium = function () {
		var currentBoardName = this.getCurrentBoardName();

		if (currentBoardName === '') {
			return; // We are not on any useful page
		} else if (currentBoardName === 'b') {
			this.changeBoardTitle(customBBoardTitle);
		}
		this.updatePageTitle();
		this.disableNightStyle();
		this.setCookie('regulamin', 'accepted');
		this.insertButtonBar();
		this.replaceEmailFieldWithSelect();

		if (boardsWithId.indexOf(currentBoardName) > -1 && this.isCurrentWebpageThread()) {
			this.colorizeAndNamePosters();
		}

		if (enableBetterFonts) {
			this.changeFonts();
		}
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
		return postContent.substr(0, Math.min(postContent.length, 70));
	};

	KurahenPremium.prototype.disableNightStyle = function () {
		var option = document.querySelector('#stylechanger option[value$="night.css"]');
		option.disabled = true;
	};

	KurahenPremium.prototype.replaceEmailFieldWithSelect = function () {
		var emailField = document.querySelector('#postform input[name="email"]');

		var select = document.createElement('select');
		select.name = 'email';
		select.style.margin = '0';
		select.style.width = '236px';
		select.addEventListener('change', function () {
			//noinspection JSPotentiallyInvalidUsageOfThis
			if (this.options[this.selectedIndex].value === 'custom') {
				var textField = document.createElement('input');
				textField.type = 'text';
				textField.className = 'board-input';
				textField.name = 'email';
				select.parentNode.replaceChild(textField, select);
				textField.focus();
			}
		}, false);

		var optionBump = document.createElement('option');
		optionBump.value = '';
		optionBump.selected = true;
		optionBump.textContent = 'Podbij';
		select.appendChild(optionBump);

		var optionSage = document.createElement('option');
		optionSage.value = 'sage';
		optionSage.textContent = 'Saguj';
		select.appendChild(optionSage);

		var optionSpoiler = document.createElement('option');
		optionSpoiler.value = 'spoiler';
		optionSpoiler.textContent = 'Ukryj obrazek';
		select.appendChild(optionSpoiler);

		var optionCustom = document.createElement('option');
		optionCustom.value = 'custom';
		optionCustom.textContent = 'Wpisz własny...';
		select.appendChild(optionCustom);

		emailField.parentNode.replaceChild(select, emailField);
	};

	KurahenPremium.prototype.colorizeAndNamePosters = function () {
		var postersIds = document.getElementsByClassName("posteruid");
		var postersStats = {};

		var opId;
		for (var i = 0; i < postersIds.length; i++) {
			var posterId = this.parsePosterId(postersIds[i].textContent);
			if (i === 0) {
				opId = posterId;
			}

			postersIds[i].className += ' poster-id-' + posterId;
			if (posterId === opId) {
				postersIds[i].textContent = '\u00a0OP nitki';
			} else {
				postersIds[i].textContent = '\u00a0' + posterId;
			}

			if (isNaN(postersStats[posterId])) {
				postersStats[posterId] = 1;
			} else {
				postersStats[posterId]++;
			}
		}

		var style = document.createElement('style');
		style.type = 'text/css';
		for (var id in postersStats) {
			if (postersStats.hasOwnProperty(id) && postersStats[id] > 1) {
				style.textContent += '.poster-id-' + id + '{color:#000;background-color: ' + this.getNextColor() + ';}';
				style.textContent += '.poster-id-' + id + ':after{content:" (' + postersStats[id] + ' postów)\u00a0"}';
			}
		}
		document.getElementsByTagName('head')[0].appendChild(style);
	};

	/**
	 * @private
	 */
	KurahenPremium.prototype.getNextColor = function () {
		if (colors.length > 0) {
			return colors.shift();
		} else {
			return "#"+((1<<24)*Math.random()|0).toString(16); // Random color
		}
	};

	/**
	 * @private
	 */
	KurahenPremium.prototype.parsePosterId = function (text) {
		return text.trim().substr(5, 8).replace(/[\.|\/|\+|\-]/g, '_');
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
