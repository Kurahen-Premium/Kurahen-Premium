// ==UserScript==
// @name        Kurahen Premium
// @namespace   karachan.org
// @description Zestaw dodatkowych funkcji dla forum młodzieżowo-katolickiego
// @version     1.5.1
// @downloadURL https://github.com/Kurahen-Premium/Kurahen-Premium/raw/master/kurahenPremium.user.js

// @grant       GM_addStyle

// @match       *://*.karachan.org/*
// @exclude     http://www.karachan.org/*/src/*
// @exclude     https://www.karachan.org/*/src/*
// @exclude     http://karachan.org/*/src/*
// @exclude     https://karachan.org/*/src/*

// @match       *://kara.8ch.net/*
// @exclude     http://kara.8ch.net/*/src/*
// @exclude     https://kara.8ch.net/*/src/*
// @exclude     http://kara.8ch.net/*/src/*
// @exclude     https://kara.8ch.net/*/src/*
// ==/UserScript==

/*jshint curly:true, noarg:true, indent:4, trailing:true, forin:true, noempty:true, quotmark:single, eqeqeq:true,
 undef:true, bitwise:true, browser:true, devel:true, nonbsp:true */

/*global GM_addStyle:false */

/* Konfiguracja */
// Tytuł deski /b/
var customBBoardTitle = '/b/ - Random';

// Usunięcie tekstu pod elementami do postowania
var deleteTextUnderPostForm = false;

// Większa czcionka liczby online
var biggerOnlineCountFont = false;

// Dodaje przycisk obok id posta który pozwala na podświetlenie wszystkich postów danego użytkownika
var enableHighlightPostsButton = true;

// Włącz/wyłącz przyciski przeskakujące do następnego/poprzedniego posta
var enableJumpButtons = true;

/* Zaawansowana konfiguracja */
// Przezroczystość postów niepodświetlonych przy pokazywaniu postów danego użytkownika:
// 0 - niewidoczny, 1 - nieprzezroczysty
var unhighlightedPostOpacity = 0.3;

var bbCodes = ['b', 'i', 'u', 'code', 'spoiler'];
var specialCharacters = [{
	contentToInsert: '\u2026',
	buttonTitle: 'Wielokropek',
	buttonLabel: '\u2026'
}, {
	contentToInsert: '\u200b',
	buttonTitle: 'Spacja o zerowej szerokości',
	buttonLabel: 'ZWSP'
}];

var wordfilters = [
	['#nowocioty', 'STAROCIOTY PAMIĘTAJĄ'],
	['#gimbo', 'xD'],
	['#penis', 'pisiorek'],
	['#wagina', 'cipuszka'],
	['#m__b', 'groźny WYKOPEK wykryty'],
	['#Lasoupeauxchoux', 'kapuśniaczek'],
	['#homoś', 'pedał'],
	['#korwinkrulempolski', 'kongres nowej prawicy'],
	['#korwin', 'KORWiN'],
	['#1%', 'groźny LEWAK wykryty'],
	['#mylittlefaggot', 'PRZYJAŹŃ JEST MAGIĄ'],
	['#tetetka', 'ALE ZAPIERDALA'],
	['/r/pcmasterrace', '/r/pcmasterrace'],
	['#shrek', 'ORK']
];
var boardsWithId = ['fz', 'z'];
var colors = [
	'#ff8080',
	'#ffdd80',
	'#80ffb7',
	'#80d0ff',
	'#c680ff',
	'#ffae80',
	'#d5ff80',
	'#80fffd',
	'#8097ff',
	'#ff80ca',
	'#ff7f7f',
	'#779aef',
	'#b0de6f',
	'#cc66c0',
	'#5cb9a9',
	'#f3bb79',
	'#8d71e2',
	'#6dd168',
	'#be5f7e',
	'#7bc8f6'
];

var allowedFileExtensions = ['gif', 'jpeg', 'jpg', 'png', 'webm'];

/* Internal configuration flags */
var roundedIdBackground = true;
var showPostCountNearHighlightPostsButton = true;
var showPostCountNearId = false;

showPostCountNearId = !enableHighlightPostsButton;
var KurahenPremium = (function () {
	function KurahenPremium() {
		var currentBoardName = PageChecker.getCurrentBoardName();

		if (currentBoardName === '' || PageChecker.isCurrentPage404()) {
			return;
		} else if (currentBoardName === 'b') {
			this.changeBoardTitle(customBBoardTitle);
		}
		this.updatePageTitle();
		this.setCookie('regulamin', 'accepted');
		this.showAllPostersEmails();

		this.fixScrollingToTarget();
		this.fixAllExternalLinks();
		this.fixAllHiders();
		this.fixAllExpanders();

		if (PageChecker.hasCurrentPagePostForm()) {
			this.replaceEmailFieldWithSelect();
			this.insertButtonBar();
		}

		if (boardsWithId.indexOf(currentBoardName) > -1 && PageChecker.isCurrentWebpageThread()) {
			this.colorizeAndNamePosters();
		}

		if (deleteTextUnderPostForm) {
			this.removeTextUnderPostForm();
		}

		if (biggerOnlineCountFont) {
			this.enlargeOnlineCountFont();
		}

		/* variable used to change "highlight posts" button state */
		this.nowHighlightedPostsUserId = false;
	}
	KurahenPremium.prototype.changeBoardTitle = function (newTitle) {
		document.title = newTitle;
		document.getElementsByClassName('boardTitle')[0].textContent = newTitle;
	};

	KurahenPremium.prototype.updatePageTitle = function () {
		var page = parseInt(window.location.pathname.split('/')[2]);
		var prefix = '';

		if (PageChecker.isCurrentWebpageThread()) {
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

	KurahenPremium.prototype.getTopicFromFirstPostContent = function () {
		var postMessage = document.querySelector('.thread .postMessage').cloneNode(true);

		var backlinks = postMessage.getElementsByClassName('backlink');
		if (backlinks.length > 0) {
			postMessage.removeChild(backlinks[0]);
		}

		var links = postMessage.getElementsByClassName('postlink');
		for (var i = 0; i < links.length; i++) {
			links[i].parentNode.removeChild(links[i]);
		}

		var quoteLinks = postMessage.getElementsByClassName('quotelink');
		for (var j = 0; j < quoteLinks.length; j++) {
			postMessage.removeChild(quoteLinks[j]);
		}

		var postContent = postMessage.textContent.trim();
		if (postContent === '') {
			return '(brak treści posta)';
		}
		return postContent.substr(0, Math.min(postContent.length, 70));
	};

	KurahenPremium.prototype.replaceEmailFieldWithSelect = function () {
		var emailField = document.querySelector('#postform input[name="email"]');

		var select = document.createElement('select');
		select.name = 'email';
		select.style.margin = '0';
		select.style.width = '236px';
		select.addEventListener('change', function () {
			// noinspection JSPotentiallyInvalidUsageOfThis
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

		var optionCustom = document.createElement('option');
		optionCustom.value = 'custom';
		optionCustom.textContent = 'Wpisz własny...';
		select.appendChild(optionCustom);

		emailField.parentNode.replaceChild(select, emailField);
	};

	KurahenPremium.prototype.showAllPostersEmails = function () {
		var postersEmails = document.getElementsByClassName('useremail');

		for (var i = 0; i < postersEmails.length; i++) {
			postersEmails[i].textContent += ' (' + this.parseMailto(postersEmails[i].getAttribute('href')) + ') ';
			postersEmails[i].removeAttribute('href');
		}
	};

	KurahenPremium.prototype.fixScrollingToTarget = function () {
		if (window.location.hash.length > 1) {
			setTimeout(function () {
				document.querySelector(window.location.hash).scrollIntoView(true);
			}, 1000);
		}
	};

	KurahenPremium.prototype.fixAllHiders = function () {
		var hiders = document.getElementsByClassName('hider');
		for (var i = 0; i < hiders.length; i++) {
			var hiderTextContent = hiders[i].textContent;
			if (hiderTextContent === '[-]') {
				hiders[i].textContent = '[—]';
			} else if (hiderTextContent === '[+]') {
				hiders[i].textContent = '[ + ]';
			}
		}
	};

	KurahenPremium.prototype.fixAllExpanders = function () {
		var expanders = document.getElementsByClassName('expander');
		for (var i = 0; i < expanders.length; i++) {
			expanders[i].textContent = 'Rozwiń';
		}
	};

	KurahenPremium.prototype.fixAllExternalLinks = function () {
		var links = document.getElementsByClassName('postlink');
		for (var i = 0; i < links.length; i++) {
			links[i].setAttribute('href', links[i].getAttribute('href').replace('https://href.li/?', ''));
			links[i].setAttribute('target', '_blank');
			links[i].setAttribute('rel', 'noreferrer');
		}

		this.inlineVideoAndAudioLinks(links);
	};

	/**
	 * @private
	 */
	KurahenPremium.prototype.parseMailto = function (mailto) {
		return mailto.replace('mailto:', '');
	};

	/**
	 * @private
	 */
	KurahenPremium.prototype.inlineVideoAndAudioLinks = function (links) {
		for (var i = 0; i < links.length; i++) {
			var url = links[i].getAttribute('href');
			if (url.indexOf('http://vocaroo.com') > -1) {
				var vocarooId = url.substr(url.length - 12, 12);

				var vocarooContainer = document.createElement('div');
				vocarooContainer.innerHTML = '<object width="148" height="44"><param name="movie"' +
					'value="http://vocaroo.com/player.swf?playMediaID=' + vocarooId + '&autoplay=0"/>' +
					'<param name="wmode" value="transparent"/>' + '<embed src="http://vocaroo.com/player.swf?playMediaID=' +
					vocarooId + '&autoplay=0" width="148" ' +
					'height="44" wmode="transparent" type="application/x-shockwave-flash"></embed></object>';

				if (links[i].nextSibling) {
					links[i].parentNode.insertBefore(vocarooContainer, links[i].nextSibling);
				} else {
					links[i].parentNode.appendChild(vocarooContainer);
				}
				links[i].style.display = 'none';
			}
		}
	};

	KurahenPremium.prototype.colorizeAndNamePosters = function () {
		var postersIds = document.getElementsByClassName('posteruid');
		var postersStats = {};

		var opId;
		for (var i = 0; i < postersIds.length; i++) {
			var posterId = this.parsePosterId(postersIds[i].textContent);
			postersIds[i].title = posterId;
			posterId = posterId.replace(/[\.|\/|\+|\-]/g, '_');

			if (i === 0) {
				opId = posterId;
			}

			postersIds[i].className += ' poster-id-' + posterId;
			if (roundedIdBackground) {
				postersIds[i].className += ' id-rounded';
			}
			if (posterId === opId) {
				postersIds[i].textContent = '\u00a0OP nitki';
			} else {
				postersIds[i].textContent = '\u00a0' + posterId;
			}

			if (typeof postersStats[posterId] === 'undefined') {
				postersStats[posterId] = [postersIds[i]];
			} else {
				postersStats[posterId].push(postersIds[i]);
			}
		}

		var style = '';
		for (var id in postersStats) {
			if (postersStats.hasOwnProperty(id) && postersStats[id].length > 1) {
				style += '.poster-id-' + id + '{color:#000;background-color: ' + this.getNextColor() + ';}\n';
				var numeral;
				if (postersStats[id].length < 5) {
					numeral = ' posty';
				} else {
					numeral = ' postów';
				}

				if (showPostCountNearId) {
					style += '.poster-id-' + id + ':after{content:" (';
					style += postersStats[id].length + numeral + ')\u00a0"}\n';
				}

				if (enableHighlightPostsButton) {
					this.setHighlightPostsButton(postersStats[id], id);
				}

				if (enableJumpButtons) {
					this.setJumpButtons(postersStats[id]);
				}
			}
		}

		if (roundedIdBackground) {
			style += '.id-rounded { font-size: 11px; border-radius: 6px; padding: 0px 6px 0px 2px;}\n';
		}
		style += '.small-icon { font-size: 16px; vertical-align: middle }\n';
		style += '.post-animated { transition: opacity 0.4s}\n';
		style += '.hiden-post { opacity: ' + unhighlightedPostOpacity + '}\n';
		style += '.highlighting-button { font-size: 11px; cursor:pointer}\n';
		style += '.highlighting-button:hover { color: orange;}\n';
		GM_addStyle(style);

		var allUserPosts = document.getElementsByClassName('postContainer');
		for (i = 0; i < allUserPosts.length; i++) {
			allUserPosts[i].classList.add('post-animated');
		}
		var firstPostBar = document.querySelector('.opContainer .postInfo');
		var threadPostersStats = document.createElement('span');
		threadPostersStats.textContent = ' (' + postersIds.length + ' postów od ' + Object.keys(postersStats).length +
			' anonów)';
		firstPostBar.appendChild(threadPostersStats);
	};

	/**
	 * @private
	 */
	KurahenPremium.prototype.getNextColor = function () {
		if (colors.length > 0) {
			return colors.shift();
		} else {
			return '#' + Math.random().toString(16).substr(-6);
		}
	};

	/**
	 * @private
	 */
	KurahenPremium.prototype.parsePosterId = function (text) {
		return text.trim().substr(5, 8);
	};

	/**
	 * @private
	 */
	KurahenPremium.prototype.getPostNo = function (userPost) {
		var id = userPost.parentNode.parentNode.getAttribute('id');
		return id.substr(2, id.length - 2);
	};

	KurahenPremium.prototype.setButtonLabelsForId = function (userId, buttonLabel, newTitle) {
		var buttons = document.querySelectorAll('[highlight-button-id="' + userId + '"]');
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].textContent = buttonLabel;
			buttons[i].title = newTitle;
		}
	};

	KurahenPremium.prototype.highlightPostsById = function (userId) {
		if (this.nowHighlightedPostsUserId) {
			var showPostsStr = ' Pokaż posty';

			if (showPostCountNearHighlightPostsButton) {
				showPostsStr += ' (' + document.getElementsByClassName('poster-id-' + userId).length + ')';
			}

			this.setButtonLabelsForId(this.nowHighlightedPostsUserId, showPostsStr, 'Podświetl posty tego użytkownika');
		}

		if (this.nowHighlightedPostsUserId === userId) {
			this.showAllPosts();
			this.nowHighlightedPostsUserId = false;
		} else {
			this.setButtonLabelsForId(userId, ' Pokaż wszystkie', 'Wróć do widoku wszystkich postów');
			this.hideAllPostsExcept(userId);
			this.nowHighlightedPostsUserId = userId;
		}
	};

	KurahenPremium.prototype.hideAllPostsExcept = function (userId) {
		// lower opacity for all posts except these with given id
		var allPosts = document.getElementsByClassName('postContainer');
		for (var i = 0; i < allPosts.length; i++) {
			if (this.getIdFromPostContainer(allPosts[i]) === userId) {
				allPosts[i].classList.remove('hiden-post');
				continue;
			}
			allPosts[i].classList.add('hiden-post');
		}
	};

	KurahenPremium.prototype.showAllPosts = function () {
		// set normal opacity for all posts
		var allPosts = document.getElementsByClassName('postContainer');
		for (var i = 0; i < allPosts.length; i++) {
			allPosts[i].classList.remove('hiden-post');
		}
	};

	KurahenPremium.prototype.getIdFromPostContainer = function (postContainer) {
		// depends on modified page src
		var idElement = postContainer.getElementsByClassName('posteruid')[0];
		for (var i = 0; idElement.classList.length; i++) {
			if (idElement.classList.item(i).indexOf('poster-id-') > -1) {
				return idElement.classList.item(i).substr('poster-id-'.length, 8);
			}
		}
		return null;
	};

	KurahenPremium.prototype.setHighlightPostsButton = function (userPosts, userId) {
		var self = this;
		var highlightPostsCallback = function () {
			self.highlightPostsById(userId);
		};
		for (var i = 0; i < userPosts.length; i++) {
			var showPostsButton = document.createElement('span');
			var showPostsStr = ' Pokaż posty';

			if (showPostCountNearHighlightPostsButton) {
				showPostsStr += ' (' + userPosts.length + ')';
			}

			showPostsButton.textContent = showPostsStr;
			showPostsButton.title = 'Podświetl posty tego użytkownika';
			showPostsButton.className = 'highlighting-button';
			showPostsButton.setAttribute('highlight-button-id', userId);
			showPostsButton.addEventListener('click', highlightPostsCallback, false);

			userPosts[i].parentNode.appendChild(showPostsButton);
		}
	};

	KurahenPremium.prototype.setJumpButtonForPost = function (post, prev, next) {
		var newButtonsContainer = document.createElement('span');
		newButtonsContainer.style.marginLeft = '3px';

		if (prev !== null) {
			var upButton = document.createElement('a');
			upButton.className = 'fa fa-chevron-up small-icon';
			upButton.title = 'Poprzedni post tego użytkownika';
			upButton.href = '#p' + prev;
			newButtonsContainer.appendChild(upButton);
		}
		if (next !== null) {
			var downButton = document.createElement('a');
			downButton.className = 'fa fa-chevron-down small-icon';
			downButton.title = 'Następny post tego użytkownika';
			downButton.href = '#p' + next;
			newButtonsContainer.appendChild(downButton);
		}

		post.parentNode.appendChild(newButtonsContainer);
	};

	KurahenPremium.prototype.setJumpButtons = function (userPosts) {
		var postsNo = [];

		for (var i = 0; i < userPosts.length; i++) {
			postsNo.push(this.getPostNo(userPosts[i]));
		}

		this.setJumpButtonForPost(userPosts[0], null, postsNo[1]);
		this.setJumpButtonForPost(userPosts[userPosts.length - 1], postsNo[postsNo.length - 2], null);

		for (i = 1; i < userPosts.length - 1; i++) {
			this.setJumpButtonForPost(userPosts[i], postsNo[i - 1], postsNo[i + 1]);
		}
	};

	KurahenPremium.prototype.insertButtonBar = function () {
		var postForm = document.getElementById('postform');
		var textarea = document.querySelector('#postform textarea');
		var buttonBar = document.createElement('div');
		buttonBar.style.textAlign = 'center';

		this.insertTextFormattingButtons(textarea, buttonBar);
		this.insertSpecialCharButtons(textarea, buttonBar);
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
			button.style.padding = '0 7px';
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
			// noinspection JSPotentiallyInvalidUsageOfThis
			var textToInsert = this.options[this.selectedIndex].value;
			var textBeforeEndOfSelection = textarea.value.substring(0, textarea.selectionEnd);
			var textAfterEndOfSelection = textarea.value.substring(textarea.selectionEnd, textarea.value.length);

			textarea.value = textBeforeEndOfSelection + textToInsert + textAfterEndOfSelection;

			textarea.focus();
			textarea.selectionStart = textBeforeEndOfSelection.length + textToInsert.length;
			textarea.selectionEnd = textarea.selectionStart;

			// noinspection JSPotentiallyInvalidUsageOfThis
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

	/**
	 * @private
	 */
	KurahenPremium.prototype.insertSpecialCharButtons = function (textarea, buttonBar) {
		var onButtonClick = function () {
			var injectedChar;
			for (var i = 0; i < specialCharacters.length; i++) {
				if (specialCharacters[i].buttonLabel === this.value) {
					injectedChar = specialCharacters[i].contentToInsert;
					break;
				}
			}

			var beforeSelect = textarea.value.substring(0, textarea.selectionStart);
			var afterSelect = textarea.value.substring(textarea.selectionStart, textarea.value.length);
			textarea.value = beforeSelect + injectedChar + afterSelect;

			textarea.focus();
			textarea.selectionStart += 1;
			textarea.selectionEnd = textarea.selectionStart;
		};

		for (var i = 0; i < specialCharacters.length; i++) {
			var button = document.createElement('input');
			button.type = 'button';
			button.value = specialCharacters[i].buttonLabel;
			button.title = specialCharacters[i].buttonTitle;
			button.style.padding = '0 7px';
			button.addEventListener('click', onButtonClick, false);
			buttonBar.appendChild(button);
		}
	};

	/**
	 * @private
	 */
	KurahenPremium.prototype.removeTextUnderPostForm = function () {
		var rules = document.querySelector('tr.rules');
		if (rules !== null) {
			rules.parentNode.removeChild(rules);
		}
	};

	/**
	 * @private
	 */
	KurahenPremium.prototype.enlargeOnlineCountFont = function () {
		var counter = document.getElementById('counter');
		var online = counter.lastChild.textContent;
		counter.removeChild(counter.lastChild);
		var newElement = document.createElement('b');
		newElement.textContent = online;
		counter.appendChild(newElement);

		var container = counter.parentElement;
		container.style.fontSize = '20px';
	};
	return KurahenPremium;
})();
var PageChecker;
(function (PageChecker) {
	'use strict';

	function isCurrentWebpageThread() {
		return window.location.pathname.split('/')[2] === 'res';
	}
	PageChecker.isCurrentWebpageThread = isCurrentWebpageThread;

	function isCurrentPage404() {
		return document.title === '404 Not Found' || document.title === '404 - karachan.org';
	}
	PageChecker.isCurrentPage404 = isCurrentPage404;

	function hasCurrentPagePostForm() {
		return document.getElementById('postform') !== null;
	}
	PageChecker.hasCurrentPagePostForm = hasCurrentPagePostForm;

	function getCurrentBoardName() {
		var shouldBeBoard = window.location.pathname.split('/')[1];
		if (shouldBeBoard === 'menu.html') {
			return '';
		}
		if (shouldBeBoard === 'news.html') {
			return '';
		}
		return shouldBeBoard;
	}
	PageChecker.getCurrentBoardName = getCurrentBoardName;
})(PageChecker || (PageChecker = {}));
/// <reference path='./typeDefinitions/greasemonkey.d.ts'/>

var main = function () {
	window.kurahenPremium = new KurahenPremium();
};

if (navigator.userAgent.toLowerCase().indexOf('chrome/') > -1) {
	// Chrome/Chromium/Opera Next
	main();
} else {
	// Firefox and others
	window.addEventListener('DOMContentLoaded', main);
}
