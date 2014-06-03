// ==UserScript==
// @name        Kurahen Premium
// @namespace   karachan.org
// @description Zestaw dodatkowych funkcji dla forum młodzieżowo-katolickiego
// @version     1.2.0
// @downloadURL https://github.com/kucanon/Kurahen-Premium/raw/master/kurahenPremium.user.js

// @grant       GM_addStyle

// @match       *://*.karachan.org/*
// @exclude     http://www.karachan.org/*/src/*
// @exclude     https://www.karachan.org/*/src/*
// @exclude     http://karachan.org/*/src/*
// @exclude     https://karachan.org/*/src/*

// @match       *://*.karachan.co/*
// @exclude     http://www.karachan.co/*/src/*
// @exclude     https://www.karachan.co/*/src/*
// @exclude     http://karachan.co/*/src/*
// @exclude     https://karachan.co/*/src/*
// ==/UserScript==

/*jshint nonew:true, jquery:true, nonstandard:true, curly:true, noarg:true, forin:true, noempty:true, quotmark:single,
 eqeqeq:true, strict:true, undef:true, bitwise:true, browser:true, devel:true */
/*global GM_addStyle:false */

var main = function () {
	'use strict';

	// Konfiguracja
	var customBBoardTitle = '/b/ - Random';
	var enableBetterFonts = true; // Podmienia domyślne czcionki na Roboto
	var deleteTextUnderPostForm = false; // Usunięcie tekstu pod elementami do postowania
	var biggerOnlineCountFont = false; // Większa czcionka liczby online
	var hideThreadsWithNoNewPosts = false; // Ukrywa na liście obserwowanych nitki bez nowych postów

	// Zaawansowana konfiguracja
	var bbCodes = ['b', 'i', 'u', 'code', 'spoiler'];
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

	var KurahenPremium = function () {
		var currentBoardName = this.getCurrentBoardName();

		if (currentBoardName === '' || this.isCurrentPage404()) {
			return; // We are not on any useful page
		} else if (currentBoardName === 'b') {
			this.changeBoardTitle(customBBoardTitle);
		}
		this.updatePageTitle();
		this.disableNightStyle();
		this.setCookie('regulamin', 'accepted');
		this.insertButtonBar();
		this.replaceEmailFieldWithSelect();
		this.showAllPostersEmails();

		this.fixScrollingToTarget();
		this.fixAllExternalLinks();
		this.fixAllHiders();
		this.fixAllExpanders();

		if (boardsWithId.indexOf(currentBoardName) > -1 && this.isCurrentWebpageThread()) {
			this.colorizeAndNamePosters();
		}

		if (enableBetterFonts) {
			this.changeFonts();
		}

		if (deleteTextUnderPostForm) {
			this.removeTextUnderPostForm();
		}

		if (biggerOnlineCountFont) {
			this.enlargeOnlineCountFont();
		}

		this.threadsWatcher = new ThreadsWatcher();
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
		var postMessage = document.querySelector('.thread .postMessage').cloneNode(true);

		var backlinks = postMessage.getElementsByClassName('backlink');
		if (backlinks.length > 0) {
			postMessage.removeChild(backlinks[0]);
		}

		var links = postMessage.getElementsByClassName('postlink');
		for (var i = 0; i < links.length; i++) {
			postMessage.removeChild(links[i]);
		}

		var quoteLinks = postMessage.getElementsByClassName('quotelink');
		for (var j = 0; j < quoteLinks.length; j++) {
			postMessage.removeChild(quoteLinks[i]);
		}

		var postContent = postMessage.textContent;
		return postContent.substr(0, Math.min(postContent.length, 70));
	};

	KurahenPremium.prototype.disableNightStyle = function () {
		var optionNight = document.querySelector('#stylechanger option[value$="night.css"]');
		optionNight.disabled = true;

		var optionNight2 = document.querySelector('#stylechanger option[value$="night2.css"]');
		optionNight2.disabled = true;
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

			if (url.indexOf('youtu') > -1) {
				var urlParameters = url.match(/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
				if (urlParameters === null || urlParameters.length !== 2) {
					continue;
				}

				var youtubeContainer = document.createElement('div');
				youtubeContainer.innerHTML = '<iframe width="560" height="315" src="//www.youtube.com/embed/' +
					urlParameters[1] + '" frameborder="0" allowfullscreen></iframe>';

				if (links[i].nextSibling) {
					links[i].parentNode.insertBefore(youtubeContainer, links[i].nextSibling);
				} else {
					links[i].parentNode.appendChild(youtubeContainer);
				}
				links[i].style.display = 'none';
			} else if (url.indexOf('http://vocaroo.com') > -1) {
				var vocarooId = url.substr(url.length - 12, 12);

				var vocarooContainer = document.createElement('div');
				vocarooContainer.innerHTML = '<object width="148" height="44"><param name="movie"' +
					'value="http://vocaroo.com/player.swf?playMediaID=' + vocarooId + '&autoplay=0"/>' +
					'<param name="wmode" value="transparent"/>' +
					'<embed src="http://vocaroo.com/player.swf?playMediaID=' + vocarooId + '&autoplay=0" width="148" ' +
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
				style += '.poster-id-' + id + ':after{content:" (' + postersStats[id].length + ' postów)\u00a0"}\n';

				this.setJumpButtons(postersStats[id]);
			}
		}

		GM_addStyle(style);

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
			return '#' + Math.random().toString(16).substr(-6); // Random color
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
	KurahenPremium.prototype.getPostNo = function (userpost) {
		var id = userpost.parentNode.parentNode.getAttribute('id');
		return id.substr(2, id.length - 2);
	};

	KurahenPremium.prototype.setJumpButtonForPost = function (post, prev, next) {
		var newButtonsContainer = document.createElement('span');

		if (prev !== null) {
			var upButton = document.createElement('a');
			upButton.className = 'fa fa-chevron-up';
			upButton.title = 'Poprzedni post tego użytkownika';
			upButton.href = '#p' + prev;
			newButtonsContainer.appendChild(upButton);
		}
		if (next !== null) {
			var downButton = document.createElement('a');
			downButton.className = 'fa fa-chevron-down';
			downButton.title = 'Następny post tego użytkownika';
			downButton.href = '#p' + next;
			newButtonsContainer.appendChild(downButton);
		}

		post.parentNode.appendChild(newButtonsContainer);
	};

	KurahenPremium.prototype.setJumpButtons = function (userIds) {
		var postsNo = [];

		for (var i = 0; i < userIds.length; i++) {
			postsNo.push(this.getPostNo(userIds[i]));
		}

		this.setJumpButtonForPost(userIds[0], null, postsNo[1]);
		this.setJumpButtonForPost(userIds[userIds.length - 1], postsNo[postsNo.length - 2], null);

		for (i = 1; i < userIds.length - 1; i++) {
			this.setJumpButtonForPost(userIds[i], postsNo[i - 1], postsNo[i + 1]);
		}
	};

	KurahenPremium.prototype.insertButtonBar = function () {
		var postForm = document.getElementById('postform');
		var textarea = document.querySelector('#postform textarea');
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

	KurahenPremium.prototype.isCurrentPage404 = function () {
		return document.title === '404 - karachan.org';
	};

	var ThreadsWatcher = function () {
		this.loadWatchedThreads();
		this.insertThreadsListWindow();
		this.addWatchButtonsToPosts();
	};

	ThreadsWatcher.prototype.loadWatchedThreads = function () {
		var item = localStorage.getItem('KurahenPremium_WatchedThreads');
		if (item === null || item === 'null') {
			this.watchedThreads = {};
		} else {
			this.watchedThreads = JSON.parse(item);
		}
	};

	ThreadsWatcher.prototype.saveWatchedThreads = function () {
		// Protection from concurrent modification
		var savedWatchedThreads = JSON.parse(localStorage.getItem('KurahenPremium_WatchedThreads')) || {};
		this.mergeWatchedThreads(savedWatchedThreads, this.watchedThreads);

		localStorage.setItem('KurahenPremium_WatchedThreads', JSON.stringify(savedWatchedThreads));
	};

	ThreadsWatcher.prototype.getWatchedThreadsWindowTopPosition = function () {
		var item = localStorage.getItem('KurahenPremium_WatchedThreads_Top');
		if (item === null || item === '') {
			return '35px';
		} else {
			return item;
		}
	};

	ThreadsWatcher.prototype.setWatchedThreadsWindowTopPosition = function (position) {
		localStorage.setItem('KurahenPremium_WatchedThreads_Top', position);
	};

	ThreadsWatcher.prototype.getWatchedThreadsWindowLeftPosition = function () {
		var item = localStorage.getItem('KurahenPremium_WatchedThreads_Left');
		if (item === null || item === '') {
			return '4px';
		} else {
			return item;
		}
	};

	ThreadsWatcher.prototype.setWatchedThreadsWindowLeftPosition = function (position) {
		localStorage.setItem('KurahenPremium_WatchedThreads_Left', position);
	};

	/**
	 * @private
	 */
	ThreadsWatcher.prototype.mergeWatchedThreads = function (originalObject, objectToAppend) {
		for (var item in objectToAppend) {
			if (objectToAppend.hasOwnProperty(item)) {
				// Add not removed threads
				if (objectToAppend[item] !== null) {
					originalObject[item] = objectToAppend[item];
				} // Remove threads removed in current window, but existent in other windows
				else if (originalObject[item] !== null) {
					delete originalObject[item];
				}
			}
		}
	};

	ThreadsWatcher.prototype.getThreadObject = function (postId, boardName) {
		return this.watchedThreads['th_' + boardName + '_' + postId];
	};

	ThreadsWatcher.prototype.addThreadObject = function (postId, boardName, lastReadPostId, topic) {
		this.watchedThreads['th_' + boardName + '_' + postId] = {
			'id': postId,
			'boardName': boardName,
			'lastReadPostId': lastReadPostId,
			'topic': topic
		};
	};

	ThreadsWatcher.prototype.updateThreadObject = function (postId, boardName, lastReadPostId) {
		this.watchedThreads['th_' + boardName + '_' + postId].lastReadPostId = lastReadPostId;
	};

	ThreadsWatcher.prototype.removeThreadObject = function (postId, boardName) {
		this.watchedThreads['th_' + boardName + '_' + postId] = null;
	};

	ThreadsWatcher.prototype.threadObjectExists = function (postId, boardName) {
		return typeof this.watchedThreads['th_' + boardName + '_' + postId] === 'object';
	};

	ThreadsWatcher.prototype.threadsSize = function () {
		return Object.keys(this.watchedThreads).length;
	};

	ThreadsWatcher.prototype.getWatchedThreadsList = function () {
		return this.watchedThreads;
	};

	ThreadsWatcher.prototype.insertThreadsListWindow = function () {
		this.threadsListWindow = document.createElement('div');
		this.threadsListWindow.id = 'watcher_box';
		this.threadsListWindow.className = 'movable';
		this.threadsListWindow.style.height = 'auto';
		this.threadsListWindow.style.minHeight = '100px';
		this.threadsListWindow.style.width = 'auto';
		this.threadsListWindow.style.minWidth = '250px';
		this.threadsListWindow.style.top = this.getWatchedThreadsWindowTopPosition();
		this.threadsListWindow.style.left = this.getWatchedThreadsWindowLeftPosition();
		this.threadsListWindow.style.padding = '5px';

		var threadsListWindowTitle = document.createElement('small');
		threadsListWindowTitle.textContent = 'Obserwowane nitki';
		this.threadsListWindow.appendChild(threadsListWindowTitle);

		this.threadsHtmlList = document.createElement('ul');
		this.threadsHtmlList.id = 'watched_list';
		this.threadsListWindow.appendChild(this.threadsHtmlList);

		var threads = this.getWatchedThreadsList();
		for (var item in threads) {
			if (threads.hasOwnProperty(item) && threads[item] !== null) {
				this.addThreadListWindowEntry(threads[item].id, threads[item].boardName, threads[item].lastReadPostId,
					-1, threads[item].topic);
			}
		}

		var self = this;
		this.threadsListWindow.addEventListener('mouseout', function () {
			self.setWatchedThreadsWindowTopPosition(self.threadsListWindow.style.top);
			self.setWatchedThreadsWindowLeftPosition(self.threadsListWindow.style.left);
		}, false);

		document.body.appendChild(this.threadsListWindow);

		var script = document.createElement('script');
		script.textContent = '$("#watcher_box").drags();';
		document.body.appendChild(script);
	};

	ThreadsWatcher.prototype.addThreadListWindowEntry = function (id, boardName, lastReadPostId, unreadPostsNumber, topic) {
		var entry = document.createElement('li');
		entry.id = 'wl_' + boardName + '_' + id;

		var link = document.createElement('a');
		link.href = '/' + boardName + '/res/' + id + '.html#p' + lastReadPostId;
		entry.appendChild(link);

		var unreadPostsSpan = document.createElement('span');
		unreadPostsSpan.className = 'unreadPostsNumber';
		unreadPostsSpan.textContent = '[' + (unreadPostsNumber >= 0 ? unreadPostsNumber : 'Ładowanie...') + '] ';
		link.appendChild(unreadPostsSpan);

		var linkTextSpan = document.createElement('span');
		linkTextSpan.textContent = '/' + boardName + '/' + id + ': ' + topic;
		link.appendChild(linkTextSpan);

		this.threadsHtmlList.appendChild(entry);

		var self = this;
		if (this.getCurrentBoardName() === boardName && id === this.getCurrentThreadId()) {
			lastReadPostId = this.getNewestPostIdFromThread(id);
			unreadPostsSpan.textContent = '[0] ';
			self.updateThreadObject(id, boardName, lastReadPostId);
			this.saveWatchedThreads();
		} else if (unreadPostsNumber < 0) {
			this.getNumberOfNewPosts(boardName, id, lastReadPostId,
				function (boardName, threadId, lastReadPostId, numberOfNewPosts, forceUpdate, status) {
					if (status === 200 && (numberOfNewPosts > 0 || !hideThreadsWithNoNewPosts)) {
						self.updateThreadListWindowEntry(threadId, boardName, lastReadPostId, numberOfNewPosts);
					} else if (status === 200 && hideThreadsWithNoNewPosts && numberOfNewPosts === 0) {
						self.removeThreadListWindowEntry(threadId, boardName);
					} else if (status === 404) {
						self.removeThreadListWindowEntry(threadId, boardName);
						self.removeThreadObject(threadId, boardName);
						self.saveWatchedThreads();
					} else {
						unreadPostsSpan.textContent = '[?] ';
					}

					if (forceUpdate) {
						self.updateThreadObject(threadId, boardName, lastReadPostId);
						self.saveWatchedThreads();
					}
				}
			);
		}
	};

	ThreadsWatcher.prototype.updateThreadListWindowEntry = function (id, boardName, lastReadPostId, unreadPostsNumber) {
		var entry = document.getElementById('wl_' + boardName + '_' + id);
		if (entry === null) {
			console.error('Cannot update nonexistent thread /' + boardName + '/' + id);
			return;
		}

		var link = entry.querySelector('a');
		link.href = '/' + boardName + '/res/' + id + '.html#p' + lastReadPostId;

		var unreadPostsSpan = link.querySelector('.unreadPostsNumber');
		unreadPostsSpan.textContent = '[' + (unreadPostsNumber >= 0 ? unreadPostsNumber : 'Ładowanie...') + '] ';
	};

	ThreadsWatcher.prototype.removeThreadListWindowEntry = function (id, boardName) {
		var entry = document.getElementById('wl_' + boardName + '_' + id);

		if (entry === null) {
			return;
		}
		this.threadsHtmlList.removeChild(entry);
	};

	ThreadsWatcher.prototype.addWatchButtonsToPosts = function () {
		var postsBars = document.querySelectorAll('.opContainer .postInfo');
		var self = this;
		var toggleWatchLabel = function () {
			if (this.textContent === 'Nie obserwuj') {
				this.textContent = 'Obserwuj';
			} else {
				this.textContent = 'Nie obserwuj';
			}
			self.addRemoveWatchedThread(parseInt(this.getAttribute('data-post-id')), self.getCurrentBoardName());
		};

		for (var i = 0; i < postsBars.length; i++) {
			var postId = this.parsePostId(postsBars[i]);
			var watchButton = document.createElement('a');
			watchButton.style.cursor = 'pointer';
			watchButton.setAttribute('data-post-id', postId);
			watchButton.addEventListener('click', toggleWatchLabel, false);

			var watchButtonContainer = document.createElement('span');
			watchButtonContainer.className = 'watch-button-container';
			watchButtonContainer.appendChild(watchButton);

			var currentBoardName = this.getCurrentBoardName();
			if (this.threadObjectExists(postId, currentBoardName)) {
				watchButton.textContent = 'Nie obserwuj';
			} else {
				watchButton.textContent = 'Obserwuj';
			}

			var postNum = postsBars[i].querySelector('span.postNum');
			postNum.insertBefore(watchButtonContainer, postNum.querySelector('span'));
		}

		GM_addStyle('.watch-button-container:before {content: " [";}\n' +
			'.watch-button-container:after{content: "] ";}');
	};

	ThreadsWatcher.prototype.addRemoveWatchedThread = function (postId, boardName) {
		// Add new thread to watchlist
		if (!this.threadObjectExists(postId, boardName)) {
			var newestPostId = this.getNewestPostIdFromThread(postId);
			var topic = this.getTopicOfThread(postId);
			this.addThreadObject(postId, boardName, newestPostId, topic);
			this.addThreadListWindowEntry(postId, boardName, newestPostId, 0, topic);
		} else { // Remove existing thread from watchlist
			this.removeThreadListWindowEntry(postId, boardName);
			this.removeThreadObject(postId, boardName);
		}

		this.saveWatchedThreads();
	};

	ThreadsWatcher.prototype.getNewestPostIdFromThread = function (threadId) {
		var posts = document.querySelectorAll('.thread[id$="' + threadId + '"] .postContainer');
		return parseInt(posts[posts.length - 1].id.substr(2));
	};

	ThreadsWatcher.prototype.getNumberOfNewPosts = function (boardName, threadId, lastPostId, callback) {
		var request = new XMLHttpRequest();
		request.open('GET', '/' + boardName + '/res/' + threadId + '.html', true);

		var self = this;
		request.onload = function () {
			var forceUpdate = false;

			// On error
			if (request.status !== 200) {
				callback(boardName, threadId, lastPostId, -1, forceUpdate, request.status);
				return;
			}

			// On success
			var parser = new DOMParser();
			var doc = parser.parseFromString(request.responseText, 'text/html');

			var postsContainers = doc.getElementsByClassName('postContainer');
			var numberOfNewPosts = 0;
			for (var i = 0; i < postsContainers.length; i++) {
				if (self.parsePostId(postsContainers[i]) === lastPostId) {
					numberOfNewPosts = postsContainers.length - 1 - i;
					break;
				}
			}

			// When last read post was deleted
			if (numberOfNewPosts === 0) {
				var lastDetectedPostId = self.parsePostId(postsContainers[postsContainers.length - 1]);
				if (lastDetectedPostId !== lastPostId) {
					lastPostId = lastDetectedPostId;
					forceUpdate = true;
				}
			}

			callback(boardName, threadId, lastPostId, numberOfNewPosts, forceUpdate, 200);
		};
		request.send();
	};

	/**
	 * @private
	 */
	ThreadsWatcher.prototype.parsePostId = function (htmlElement) {
		return parseInt(htmlElement.id.substr(2));
	};

	/**
	 * @private
	 */
	ThreadsWatcher.prototype.getCurrentBoardName = function () {
		return document.querySelector('meta[property="og:boardname"]').getAttribute('content');
	};

	/**
	 * @private
	 */
	ThreadsWatcher.prototype.getCurrentThreadId = function () {
		if (window.location.pathname.split('/')[2] !== 'res') {
			return -1;
		}
		return parseInt(document.querySelector('.thread .opContainer').id.substr(2));
	};

	ThreadsWatcher.prototype.getTopicOfThread = function (threadId) {
		var postMessage = document.querySelector('.thread[id$="' + threadId + '"] .postMessage').cloneNode(true);

		var backlinks = postMessage.getElementsByClassName('backlink');
		if (backlinks.length > 0) {
			postMessage.removeChild(backlinks[0]);
		}

		var links = postMessage.getElementsByClassName('postlink');
		for (var i = 0; i < links.length; i++) {
			postMessage.removeChild(links[i]);
		}

		var quoteLinks = postMessage.getElementsByClassName('quotelink');
		for (var j = 0; j < quoteLinks.length; j++) {
			postMessage.removeChild(quoteLinks[i]);
		}

		var postContent = postMessage.textContent;
		if (postContent === '') {
			return '(brak treści posta)';
		}
		return postContent.substr(0, Math.min(postContent.length, 25));
	};

	// Initialize script
	window.KurahenPremium = new KurahenPremium();
};

if (navigator.userAgent.toLowerCase().indexOf('chrome/') > -1) {
	// Chrome/Chromium/Opera Next
	main();
} else {
	// Firefox and others
	window.addEventListener('load', main);
}
