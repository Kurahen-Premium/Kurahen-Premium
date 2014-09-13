class KurahenPremium {

	nowHighlightedPostsUserId;
	threadsWatcher;
	formValidator = new FormValidator();

	constructor() {
		var currentBoardName = PageChecker.getCurrentBoardName();

		if (currentBoardName === '' || PageChecker.isCurrentPage404()) {
			return; // We are not on any useful page
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

		if (enableBetterFonts) {
			this.changeFonts();
		}

		if (deleteTextUnderPostForm) {
			this.removeTextUnderPostForm();
		}

		if (biggerOnlineCountFont) {
			this.enlargeOnlineCountFont();
		}

		/* variable used to change "highlight posts" button state */
		this.nowHighlightedPostsUserId = false;
		this.threadsWatcher = new ThreadsWatcher();
	}

	changeBoardTitle(newTitle) {
		document.title = newTitle;
		document.getElementsByClassName('boardTitle')[0].textContent = newTitle;
	}

	updatePageTitle() {
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
	}

	setCookie(name, value) {
		document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + '; path=/; max-age=2592000';
	}

	changeFonts() {
		var newLink = document.createElement('link');
		newLink.href = '//fonts.googleapis.com/css?family=Roboto:400,700&subset=latin,latin-ext';
		newLink.rel = 'stylesheet';
		var existingLink = document.getElementsByTagName('link')[0];
		existingLink.parentNode.insertBefore(newLink, existingLink);
		document.body.style.fontFamily = 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif';
	}

	getTopicFromFirstPostContent() {
		var postMessage = <HTMLElement>document.querySelector('.thread .postMessage').cloneNode(true);

		var backlinks = postMessage.getElementsByClassName('backlink');
		if (backlinks.length > 0) {
			postMessage.removeChild(backlinks[0]);
		}

		var links = <HTMLCollection>postMessage.getElementsByClassName('postlink');
		for (var i = 0; i < links.length; i++) {
			links[i].parentNode.removeChild(links[i]);
		}

		var quoteLinks = postMessage.getElementsByClassName('quotelink');
		for (var j = 0; j < quoteLinks.length; j++) {
			postMessage.removeChild(quoteLinks[i]);
		}

		var postContent = postMessage.textContent.trim();
		if (postContent === '') {
			return '(brak treści posta)';
		}
		return postContent.substr(0, Math.min(postContent.length, 70));
	}

	replaceEmailFieldWithSelect() {
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
	}

	showAllPostersEmails() {
		var postersEmails = <HTMLElement[]><any>document.getElementsByClassName('useremail');

		for (var i = 0; i < postersEmails.length; i++) {
			postersEmails[i].textContent += ' (' + this.parseMailto(postersEmails[i].getAttribute('href')) + ') ';
			postersEmails[i].removeAttribute('href');
		}
	}

	fixScrollingToTarget() {
		if (window.location.hash.length > 1) {
			setTimeout(function () {
				(<HTMLElement>document.querySelector(window.location.hash)).scrollIntoView(true);
			}, 1000);
		}
	}

	fixAllHiders() {
		var hiders = <HTMLElement[]><any>document.getElementsByClassName('hider');
		for (var i = 0; i < hiders.length; i++) {
			var hiderTextContent = hiders[i].textContent;
			if (hiderTextContent === '[-]') {
				hiders[i].textContent = '[—]';
			} else if (hiderTextContent === '[+]') {
				hiders[i].textContent = '[ + ]';
			}
		}
	}

	fixAllExpanders() {
		var expanders = <HTMLElement[]><any>document.getElementsByClassName('expander');
		for (var i = 0; i < expanders.length; i++) {
			expanders[i].textContent = 'Rozwiń';
		}
	}

	fixAllExternalLinks() {
		var links = <HTMLElement[]><any>document.getElementsByClassName('postlink');
		for (var i = 0; i < links.length; i++) {
			links[i].setAttribute('href', links[i].getAttribute('href').replace('https://href.li/?', ''));
			links[i].setAttribute('target', '_blank');
			links[i].setAttribute('rel', 'noreferrer');
		}

		this.inlineVideoAndAudioLinks(links);
	}

	/**
	 * @private
	 */
	parseMailto(mailto) {
		return mailto.replace('mailto:', '');
	}

	/**
	 * @private
	 */
	inlineVideoAndAudioLinks(links) {
		for (var i = 0; i < links.length; i++) {
			var url = links[i].getAttribute('href');
			if (url.indexOf('http://vocaroo.com') > -1) {
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
	}

	colorizeAndNamePosters() {
		var postersIds = <HTMLElement[]><any>document.getElementsByClassName('posteruid');
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

		var allUserPosts = <HTMLElement[]><any>document.getElementsByClassName('postContainer');
		for (i = 0; i < allUserPosts.length; i++) {
			allUserPosts[i].classList.add('post-animated');
		}
		var firstPostBar = document.querySelector('.opContainer .postInfo');
		var threadPostersStats = document.createElement('span');
		threadPostersStats.textContent = ' (' + postersIds.length + ' postów od ' + Object.keys(postersStats).length +
			' anonów)';
		firstPostBar.appendChild(threadPostersStats);
	}

	/**
	 * @private
	 */
	getNextColor() {
		if (colors.length > 0) {
			return colors.shift();
		} else {
			return '#' + Math.random().toString(16).substr(-6); // Random color
		}
	}

	/**
	 * @private
	 */
	parsePosterId(text) {
		return text.trim().substr(5, 8);
	}

	/**
	 * @private
	 */
	getPostNo(userPost) {
		var id = userPost.parentNode.parentNode.getAttribute('id');
		return id.substr(2, id.length - 2);
	}

	setButtonLabelsForId(userId, buttonLabel, newTitle) {
		var buttons = <HTMLElement[]><any>document.querySelectorAll('[highlight-button-id="' + userId + '"]');
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].textContent = buttonLabel;
			buttons[i].title = newTitle;
		}
	}

	highlightPostsById(userId) {
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
	}

	hideAllPostsExcept(userId) {
		// lower opacity for all posts except these with given id
		var allPosts = <HTMLElement[]><any>document.getElementsByClassName('postContainer');
		for (var i = 0; i < allPosts.length; i++) {
			if (this.getIdFromPostContainer(allPosts[i]) === userId) {
				allPosts[i].classList.remove('hiden-post');
				continue;
			}
			allPosts[i].classList.add('hiden-post');
		}
	}

	showAllPosts() {
		// set normal opacity for all posts
		var allPosts = <HTMLElement[]><any>document.getElementsByClassName('postContainer');
		for (var i = 0; i < allPosts.length; i++) {
			allPosts[i].classList.remove('hiden-post');
		}
	}

	getIdFromPostContainer(postContainer) {
		// depends on modified page src
		var idElement = postContainer.getElementsByClassName('posteruid')[0];
		for (var i = 0; idElement.classList.length; i++) {
			if (idElement.classList.item(i).indexOf('poster-id-') > -1) {
				return idElement.classList.item(i).substr('poster-id-'.length, 8);
			}
		}
		return null;
	}

	setHighlightPostsButton(userPosts, userId) {
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
	}

	setJumpButtonForPost(post, prev, next) {
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
	}

	setJumpButtons(userPosts) {
		var postsNo = [];

		for (var i = 0; i < userPosts.length; i++) {
			postsNo.push(this.getPostNo(userPosts[i]));
		}

		this.setJumpButtonForPost(userPosts[0], null, postsNo[1]);
		this.setJumpButtonForPost(userPosts[userPosts.length - 1], postsNo[postsNo.length - 2], null);

		for (i = 1; i < userPosts.length - 1; i++) {
			this.setJumpButtonForPost(userPosts[i], postsNo[i - 1], postsNo[i + 1]);
		}
	}

	insertButtonBar() {
		var postForm = document.getElementById('postform');
		var textarea = document.querySelector('#postform textarea');
		var buttonBar = document.createElement('div');
		buttonBar.style.textAlign = 'center';

		this.insertTextFormattingButtons(textarea, buttonBar);
		this.insertSpecialCharButtons(textarea, buttonBar);
		this.insertWordfilterList(textarea, buttonBar);

		postForm.insertBefore(buttonBar, postForm.firstChild);
	}

	/**
	 * @private
	 */
	insertTextFormattingButtons(textarea, buttonBar) {
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
	}

	/**
	 * @private
	 */
	insertWordfilterList(textarea, buttonBar) {
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
	}

	/**
	 * @private
	 */
	insertSpecialCharButtons(textarea, buttonBar) {
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
	}

	/**
	 * @private
	 */
	removeTextUnderPostForm() {
		var rules = document.querySelector('tr.rules');
		if (rules !== null) {
			rules.parentNode.removeChild(rules);
		}
	}

	/**
	 * @private
	 */
	enlargeOnlineCountFont() {
		var counter = document.getElementById('counter');
		var online = counter.lastChild.textContent;
		counter.removeChild(counter.lastChild);
		var newElement = document.createElement('b');
		newElement.textContent = online;
		counter.appendChild(newElement);

		var container = counter.parentElement;
		container.style.fontSize = '20px';
	}

}
