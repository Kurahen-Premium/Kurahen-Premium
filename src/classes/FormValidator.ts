class FormValidator {

	constructor() {
		this.setSubmitAction();
	}

	setSubmitAction(): void {
		if (!PageChecker.hasCurrentPagePostForm()) { return; }
		if (document.cookie.indexOf('in_mod') !== -1) { return; }

		document.getElementById('submit').addEventListener('click', (ev) => {
			if (!this.isFileInputFilled() && !this.isPostTextFilled()) {
				ev.preventDefault();
				alert('Napisz post lub dodaj śmieszny obrazek');
				return;
			}

			if (this.getCaptchaFieldTextLenght() !== 6) {
				ev.preventDefault();
				alert('Ale kapcze to popraw');
				return;
			}

			if (this.getFileSize() > this.getMaxFileSize()) {
				ev.preventDefault();
				alert('Plik zbyt duży');
				return;
			}

			if (PageChecker.isCurrentWebpageThread()) {
				if (this.isFileInputFilled() && !this.isAllowedFileExt()) {
					this.reactToNotAllowedFileExt(ev);
				}
				return;
			}

			if (!this.isNoFileAllowed() && !this.isFileInputFilled()) {
				ev.preventDefault();
				alert('Wybierz plik');
				return;
			}

			if (!this.isFileInputFilled() && !this.isNoFileChecked()) {
				if (confirm('Wysłać bez pliku?')) {
					this.setNoFile();
				} else {
					ev.preventDefault();
				}
				return;
			}

			if (this.isFileInputFilled() && !this.isAllowedFileExt()) {
				this.reactToNotAllowedFileExt(ev);
			}

		});
	}

	reactToNotAllowedFileExt(ev: MouseEvent) {
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

	isFileInputFilled(): boolean {
		var fileFile = <HTMLInputElement> document.getElementById('postFile');
		if (fileFile) {
			return fileFile.value !== '';
		} else {
			return false;
		}
	}

	getFileSize(): number {
		if (!this.isFileInputFilled()) { return 0; }
		return (<HTMLInputElement> document.getElementById('postFile')).files[0].size;
	}

	getMaxFileSize(): number {
		var maxFileList = document.getElementsByName('MAX_FILE_SIZE');
		if (maxFileList.length === 0) { return 0; }
		var valStr = (<HTMLInputElement> maxFileList[0]).value;
		return parseInt(valStr);
	}

	getCaptchaFieldTextLenght(): number {
		var captchaField = <HTMLInputElement> document.getElementById('captchaField');
		if (captchaField) {
			return captchaField.value.length;
		} else {
			return 0;
		}
	}

	isNoFileChecked(): boolean {
		if (this.isNoFileAllowed()) {
			return (<HTMLInputElement> document.getElementById('nofile')).checked;
		} else {
			return false;
		}
	}

	isNoFileAllowed(): boolean {
		if (document.getElementById('nofile')) {
			return true;
		} else {
			return false;
		}
	}

	isAllowedFileExt(): boolean {
		if (!this.isFileInputFilled()) { return false; }
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
