module PageChecker {
	'use strict';

	export function isCurrentWebpageThread(): boolean {
		return window.location.pathname.split('/')[2] === 'res';
	}

	export function isCurrentPage404(): boolean {
		return document.title === '404 Not Found' || document.title === '404 - karachan.org';
	}

	export function hasCurrentPagePostForm(): boolean {
		return document.getElementById('postform') !== null;
	}

	export function getCurrentBoardName(): string {
		var shouldBeBoard = window.location.pathname.split('/')[1];
		if (shouldBeBoard === 'menu.html') { return ''; }
		if (shouldBeBoard === 'news.html') { return ''; }
		return shouldBeBoard;
	}
}
