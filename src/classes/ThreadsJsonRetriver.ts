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
			var obj = JSON.parse(jsonReq.responseText);
			onDone(obj.posts);
		}
		jsonReq.send();
	}

	function getJsonURL(threadURL: string): string {
		var urlWithoutExt = threadURL.split('.')[0];
		return urlWithoutExt + '.json';
	}
}