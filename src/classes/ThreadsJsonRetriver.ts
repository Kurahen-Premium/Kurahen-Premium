module ThreadsJsonRetriver {
	export interface Post {
		com: string;
		name: string;
		no: number;
		now: string;
		resto: number;
		time: number;
	}

	export function getThreadObj(threadUrl: string, onDone: (posts: Post[]) => void): void {
		var jsonUrl = getJsonURL(threadUrl);
		var jsonReq = new XMLHttpRequest();

		jsonReq.open('GET', jsonUrl);
		jsonReq.onloadend = () => {
			var obj: Post[] = JSON.parse(jsonReq.responseText).posts;
			obj.shift();
			obj.sort(function (a, b) {
				return a.no - b.no;
			});
			onDone(obj);
		};
		jsonReq.send();
	}

	function getJsonURL(threadURL: string): string {
		var urlInParts = threadURL.split('.');
		urlInParts.pop();
		return urlInParts.join('.') + '.json';
	}
}
