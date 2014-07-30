module UrlChecker {
	'use strict';

	export function isCurrentWebpageThread(): boolean {
		return window.location.pathname.split('/')[2] === 'res';
	}

	export function isCurrentPage404(): boolean {
		return document.title === '404 Not Found';
	}
}
