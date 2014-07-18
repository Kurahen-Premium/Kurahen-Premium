class FormValidator {
	private kurahenPremium: KurahenPremium;

	constructor(KurachenPremium: KurahenPremium) {
		this.kurahenPremium = KurachenPremium;
		this.setSubmitAction();
	}

	setSubmitAction() {
		document.getElementById('submit').addEventListener("click", (ev) => {
			if (!this.isPostTextFilled()) {
				ev.preventDefault();
				alert('Ale post to napisz');
				return;
			}

			if (this.getPostTextLength() > 6000) {
				ev.preventDefault();
				alert('Zbyt długi post');
				return;
			}

			if (!this.isCaptchaFilled()) {
				ev.preventDefault();
				alert('Ale kapcze to wypełnij');
				return;
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
		return (<HTMLTextAreaElement> document.getElementsByName("com")[0]).value !== '';
	}

	getPostTextLength(): number {
		return (<HTMLTextAreaElement> document.getElementsByName("com")[0]).value.length;
	}

	isCaptchaFilled(): boolean {
		return (<HTMLInputElement> document.getElementById('captchaField')).value !== '';
	}

	isFileInputFilled(): boolean {
		return (<HTMLInputElement> document.getElementById('postFile')).value !== '';
	}

	isNoFileChecked(): boolean {
		return (<HTMLInputElement>document.getElementById("nofile")).checked;
	}

	setNoFile() {
		(<HTMLInputElement>document.getElementById("nofile")).checked = true;
	}
}