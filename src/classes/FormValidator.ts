class FormValidator {
	private kurahenPremium: KurahenPremium;

	constructor(KurachenPremium: KurahenPremium) {
		this.kurahenPremium = KurachenPremium;
		this.setSubmitAction();
	}

	setSubmitAction() {
		document.getElementById('submit').addEventListener('click', (ev) => {
			if (!this.isPostTextFilled()) {
				ev.preventDefault();
				alert('Ale post to napisz');
				return;
			}

			if (this.getPostTextLength() > maxPostLength) {
				ev.preventDefault();
				alert('Zbyt długi post');
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

			if (!this.isAllowedFile()) {
				if (!confirm('Plik najprawdopodobniej nie jest obsługiwany, pomimo to chcesz procedować dalej?')) {
					ev.preventDefault();
					return;
				}
			}

			if (!this.kurahenPremium.isCurrentWebpageThread()) {
				if (!this.isFileInputFilled() && !this.isNoFileChecked()) {
					if (confirm('Wysłać bez pliku?')) {
						this.setNoFile();
					}
					else {
						ev.preventDefault();
					}
				}
			}
		});
	}

	isPostTextFilled(): boolean {
		return (<HTMLTextAreaElement> document.getElementsByName('com')[0]).value !== '';
	}

	getPostTextLength(): number {
		return (<HTMLTextAreaElement> document.getElementsByName('com')[0]).value.length;
	}

	getFileSize(): number {
		if (!this.isFileInputFilled()) return 0;
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
		var fileName = (<HTMLInputElement> document.getElementById('postFile')).files[0].name;
		var ext = fileName.split('.').pop();
		for (var i = 0; i < allowedFileExtensions.length; i++) {
			if (ext === allowedFileExtensions[i]) return true;
		}
		return false;
	}

	setNoFile() {
		(<HTMLInputElement>document.getElementById('nofile')).checked = true;
	}
}