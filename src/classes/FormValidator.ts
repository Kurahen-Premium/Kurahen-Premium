class FormValidator {
	private isCurrentWebpageThread: () => void;

	constructor(isCurrentWebpageThreadFunc: () => void) {
		this.isCurrentWebpageThread = isCurrentWebpageThreadFunc;
		this.setSubmitAction();
	}

	setSubmitAction(): void {
		document.getElementById('submit').addEventListener('click', (ev) => {
			if (!this.isFileInputFilled() && !this.isPostTextFilled()) {
				ev.preventDefault();
				alert('Napisz post lub dodaj śmieszny obrazek');
				return;
			}

			if (!this.isCaptchaFilled()) {
				ev.preventDefault();
				alert('Ale kapcze to wypełnij');
				return;
			}

			if (this.getFileSize() > maxFileSize) {
				ev.preventDefault();
				alert('Plik zbyt duży');
				return;
			}

			if (this.isCurrentWebpageThread()) {
				if (this.isFileInputFilled() && !this.isAllowedFile()) {
					this.reactToNotAllowedFile(ev);
				}
				return;
			}

			if (!this.isFileInputFilled() && !this.isNoFileChecked()) {
				if (confirm('Wysłać bez pliku?')) {
					this.setNoFile();
				} else {
					ev.preventDefault();
					return;
				}
			} else {
				if (!this.isAllowedFile()) {
					this.reactToNotAllowedFile(ev);
				}
			}
		});
	}

	private reactToNotAllowedFile(ev: MouseEvent) {
		if (!confirm('Plik najprawdopodobniej nie jest obsługiwany, pomimo to chcesz procedować dalej?')) {
			ev.preventDefault();
		}
	}

	isPostTextFilled(): boolean {
		return this.getPostTextLength() > 0;
	}

	getPostTextLength(): number {
		return (<HTMLTextAreaElement> document.getElementsByName('com')[0]).value.length;
	}

	getFileSize(): number {
		if (!this.isFileInputFilled()) { return 0; }
		return (<HTMLInputElement> document.getElementById('postFile')).files[0].size;
	}

	isCaptchaFilled(): boolean {
		return (<HTMLInputElement> document.getElementById('captchaField')).value !== '';
	}

	isFileInputFilled(): boolean {
		return (<HTMLInputElement> document.getElementById('postFile')).value !== '';
	}

	isNoFileChecked(): boolean {
		return (<HTMLInputElement>document.getElementById('nofile')).checked;
	}

	isAllowedFile(): boolean {
		if (!this.isFileInputFilled) { return false; }
		var fileName = (<HTMLInputElement> document.getElementById('postFile')).files[0].name;
		var ext = fileName.split('.').pop().toLowerCase();
		for (var i = 0; i < allowedFileExtensions.length; i++) {
			if (ext === allowedFileExtensions[i]) { return true; }
		}
		return false;
	}

	setNoFile(): void {
		(<HTMLInputElement>document.getElementById('nofile')).checked = true;
	}
}
