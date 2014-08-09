interface Post {
	com: string;
	name: string;
	no: string;
	now: string;
	resto: string;
	time: string;
}

class ThreadsWatcher {

	watchedThreads;
	threadsListWindow: HTMLDivElement;
	threadsHtmlList;

	constructor() {
		this.loadWatchedThreads();
		this.insertThreadsListWindow();
		this.addWatchButtonsToPosts();
	}

	loadWatchedThreads() {
		var item = localStorage.getItem('KurahenPremium_WatchedThreads');
		if (item === null || item === 'null') {
			this.watchedThreads = {};
		} else {
			this.watchedThreads = JSON.parse(item);
		}
	}

	saveWatchedThreads() {
		// Protection from concurrent modification
		var savedWatchedThreads = JSON.parse(localStorage.getItem('KurahenPremium_WatchedThreads')) || {};
		this.mergeWatchedThreads(savedWatchedThreads, this.watchedThreads);

		localStorage.setItem('KurahenPremium_WatchedThreads', JSON.stringify(savedWatchedThreads));
	}

	getWatchedThreadsWindowTopPosition() {
		var item = localStorage.getItem('KurahenPremium_WatchedThreads_Top');
		if (item === null || item === '') {
			return '35px';
		} else {
			return item;
		}
	}

	setWatchedThreadsWindowTopPosition(position) {
		localStorage.setItem('KurahenPremium_WatchedThreads_Top', position);
	}

	getWatchedThreadsWindowLeftPosition() {
		var item = localStorage.getItem('KurahenPremium_WatchedThreads_Left');
		if (item === null || item === '') {
			return '4px';
		} else {
			return item;
		}
	}

	setWatchedThreadsWindowLeftPosition(position) {
		localStorage.setItem('KurahenPremium_WatchedThreads_Left', position);
	}

	getWatchedThreadsWindowCssPosition(): string {
		var item = localStorage.getItem('KurahenPremium_WatchedThreads_CSS_Position');
		if (item === null || item === '') {
			return 'absolute';
		} else {
			return item;
		}
	}

	setWatchedThreadsWindowCssPosition(positionProperity) {
		localStorage.setItem('KurahenPremium_WatchedThreads_CSS_Position', positionProperity);
	}

	/**
	 * @private
	 */
	mergeWatchedThreads(originalObject, objectToAppend) {
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
	}

	getThreadObject(postId, boardName) {
		return this.watchedThreads['th_' + boardName + '_' + postId];
	}

	addThreadObject(postId, boardName, lastReadPostId, topic) {
		this.watchedThreads['th_' + boardName + '_' + postId] = {
			'id': postId,
			'boardName': boardName,
			'lastReadPostId': lastReadPostId,
			'topic': topic
		};
	}

	updateThreadObject(postId, boardName, lastReadPostId) {
		this.watchedThreads['th_' + boardName + '_' + postId].lastReadPostId = lastReadPostId;
	}

	removeThreadObject(postId, boardName) {
		this.watchedThreads['th_' + boardName + '_' + postId] = null;
	}

	threadObjectExists(postId, boardName) {
		return typeof this.watchedThreads['th_' + boardName + '_' + postId] === 'object' &&
			this.watchedThreads['th_' + boardName + '_' + postId] !== null;
	}

	threadsSize() {
		return Object.keys(this.watchedThreads).length;
	}

	getWatchedThreadsList() {
		return this.watchedThreads;
	}

	insertThreadsListWindow() {
		this.threadsListWindow = document.createElement('div');
		this.threadsListWindow.id = 'watcher_box';
		this.threadsListWindow.className = 'movable';
		this.threadsListWindow.style.height = 'auto';
		this.threadsListWindow.style.minHeight = '100px';
		this.threadsListWindow.style.width = 'auto';
		this.threadsListWindow.style.minWidth = '250px';
		this.threadsListWindow.style.position = this.getWatchedThreadsWindowCssPosition();
		this.threadsListWindow.style.top = this.getWatchedThreadsWindowTopPosition();
		this.threadsListWindow.style.left = this.getWatchedThreadsWindowLeftPosition();
		this.threadsListWindow.style.padding = '5px';


		var threadsListWindowTitle = document.createElement('small');
		threadsListWindowTitle.textContent = 'Obserwowane nitki';
		this.threadsListWindow.appendChild(threadsListWindowTitle);

		var threadsListWindowSticker = document.createElement('img');
		threadsListWindowSticker.src = '/img/sticky.gif';
		threadsListWindowSticker.style.position = 'absolute';
		if (this.threadsListWindow.style.position === 'absolute') {
			threadsListWindowSticker.style.opacity = '0.25';
		} else {
			threadsListWindowSticker.style.opacity = '1.0';
		}
		threadsListWindowSticker.style.right = '0px';
		threadsListWindowSticker.style.cursor = 'default';
		threadsListWindowSticker.onclick = (ev) => {
			var stick = <HTMLImageElement> ev.toElement;
			if (stick.style.opacity === '1') {
				stick.style.opacity = '0.25';
				this.threadsListWindow.style.position = 'absolute';
				this.setWatchedThreadsWindowCssPosition('absolute');
				var newtop = parseInt(this.threadsListWindow.style.top) + document.body.scrollTop;
				this.threadsListWindow.style.top = newtop + 'px';
			} else {
				stick.style.opacity = '1';
				this.threadsListWindow.style.position = 'fixed';
				this.setWatchedThreadsWindowCssPosition('fixed');
				newtop = parseInt(this.threadsListWindow.style.top) - document.body.scrollTop;
				this.threadsListWindow.style.top = newtop + 'px';
			}
		};
		this.threadsListWindow.appendChild(threadsListWindowSticker);

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
	}

	addThreadListWindowEntry(id, boardName, lastReadPostId, unreadPostsNumber, topic) {
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
			this.getNumberOfNewPostsJSON(boardName, id, lastReadPostId,
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
				});
		}
	}

	updateThreadListWindowEntry(id, boardName, lastReadPostId, unreadPostsNumber) {
		var entry = document.getElementById('wl_' + boardName + '_' + id);
		if (entry === null) {
			console.error('Cannot update nonexistent thread /' + boardName + '/' + id);
			return;
		}

		var link = <HTMLAnchorElement>entry.querySelector('a');
		link.href = '/' + boardName + '/res/' + id + '.html#p' + lastReadPostId;

		var unreadPostsSpan = link.querySelector('.unreadPostsNumber');
		unreadPostsSpan.textContent = '[' + (unreadPostsNumber >= 0 ? unreadPostsNumber : 'Ładowanie...') + '] ';
	}

	removeThreadListWindowEntry(id, boardName) {
		var entry = document.getElementById('wl_' + boardName + '_' + id);

		if (entry === null) {
			return;
		}
		this.threadsHtmlList.removeChild(entry);
	}

	addWatchButtonsToPosts() {
		var postsBars = <HTMLElement[]><any>document.querySelectorAll('.opContainer .postInfo');
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
			watchButton.setAttribute('data-post-id', postId.toString());
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
	}

	addRemoveWatchedThread(postId, boardName) {
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
	}

	getNewestPostIdFromThread(threadId) {
		var posts = <HTMLElement[]><any>document.querySelectorAll('.thread[id$="' + threadId + '"] .postContainer');
		return parseInt(posts[posts.length - 1].id.substr(2));
	}

	getNumberOfNewPosts(boardName, threadId, lastPostId, callback) {
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
	}

	getNumberOfNewPostsJSON(boardName: string, threadId: number, lastPostId: number, callback: (boardName: string,
		threadId: number, lastPostId: number, numberOfNewPosts: number, forceUpdate: boolean,
		reqStatus: number) => void) {

		var request = new XMLHttpRequest();

		request.open('GET', '/' + boardName + '/res/' + threadId + '.json');
		request.onload = () => {
			var forceUpdate = false;

			// On error
			if (request.status !== 200) {
				callback(boardName, threadId, lastPostId, -1, forceUpdate, request.status);
				return;
			}

			// On success
			var posts: Post[] = JSON.parse(request.responseText).posts;
			posts.shift();

			// If only op post
			if (posts.length === 0) {
				callback(boardName, threadId, lastPostId, 0, forceUpdate, request.status);
				return;
			}

			posts.sort(function (a, b) {
				return parseInt(a.no) - parseInt(b.no);
			});

			var numberOfNewPosts = 0;
			for (var i = 0; i < posts.length; i++) {
				if (parseInt(posts[i].no) === lastPostId) {
					numberOfNewPosts = posts.length - 1 - i;
					break;
				}
			}

			// When last read post was deleted
			if (numberOfNewPosts === 0) {
				var lastDetectedPostId = parseInt(posts[posts.length - 1].no);
				if (lastDetectedPostId !== lastPostId) {
					lastPostId = lastDetectedPostId;
					forceUpdate = true;
				}
			}
			callback(boardName, threadId, lastPostId, numberOfNewPosts, forceUpdate, request.status);
		};
		request.send();
	}

	/**
	 * @private
	 */
	parsePostId(htmlElement) {
		return parseInt(htmlElement.id.substr(2));
	}

	/**
	 * @private
	 */
	getCurrentBoardName() {
		return document.querySelector('meta[property="og:boardname"]').getAttribute('content');
	}

	/**
	 * @private
	 */
	getCurrentThreadId() {
		if (window.location.pathname.split('/')[2] !== 'res') {
			return -1;
		}
		return parseInt((<HTMLElement>document.querySelector('.thread .opContainer')).id.substr(2));
	}

	getTopicOfThread(threadId) {
		var postMessage = <HTMLElement>document.querySelector('.thread[id$="' + threadId + '"] .postMessage').cloneNode(true);

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
			postMessage.removeChild(quoteLinks[i]);
		}

		var postContent = postMessage.textContent.trim();
		if (postContent === '') {
			return '(brak treści posta)';
		}
		return postContent.substr(0, Math.min(postContent.length, 25));
	}
}
