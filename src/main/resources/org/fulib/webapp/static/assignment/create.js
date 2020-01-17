// =============== Elements ===============

const titleInput = document.getElementById('titleInput');
const authorInput = document.getElementById('authorInput');
const emailInput = document.getElementById('emailInput');
const deadlineDateInput = document.getElementById('deadlineDateInput');
const deadlineTimeInput = document.getElementById('deadlineTimeInput');
const descriptionInput = document.getElementById('descriptionInput');

const titleLabel = document.getElementById('titleLabel');
const assignmentLink = document.getElementById('link');
const copyLinkButton = document.getElementById('copyLinkButton');

const solutionInput = document.getElementById('solutionInput');
const solutionInputCM = CodeMirror.fromTextArea(solutionInput, {
	theme: 'idea',
	mode: 'markdown',
	lineNumbers: true,
	lineWrapping: true,
	styleActiveLine: true,
});

const verificationInput = document.getElementById('verificationInput');
const verificationInputCM = CodeMirror.fromTextArea(verificationInput, {
	theme: 'idea',
	mode: 'markdown',
	lineNumbers: true,
	lineWrapping: true,
	styleActiveLine: true,
});

// =============== Initialization ===============

init();

function init() {
	updateEditorTheme();
	themeChangeHandlers.push(updateEditorTheme);

	autoSave('assignment/create/',
		titleInput,
		authorInput,
		emailInput,
		deadlineDateInput,
		deadlineTimeInput,
		descriptionInput,
	);
}

// =============== Functions ===============

function updateEditorTheme(theme = getTheme()) {
	let editorTheme = theme === 'dark' ? 'darcula' : 'idea';
	solutionInputCM.setOption('theme', editorTheme);
	verificationInputCM.setOption('theme', editorTheme);
}

function submit() {
	const data = {
		title: titleInput.value,
		author: authorInput.value,
		email: emailInput.value,
		deadline: new Date(deadlineDateInput.value + ' ' + deadlineTimeInput.value).toISOString(),
		description: descriptionInput.value,
		solution: solutionInputCM.getValue(),
		tasks: [
			{
				description: '', // TODO input field
				points: 100, // TODO input field
				verification: verificationInputCM.getValue(),
			},
		],
	};

	api('POST', '/assignment', data, result => {
		const url = new URL(window.location);
		const link = `${url.protocol}//${url.host}/assignment/${result.id}`;
		titleLabel.innerText = titleInput.value;
		assignmentLink.href = link;
		assignmentLink.innerText = link;
		$('#successModal').modal('show');
	});
}

function onCopyLink() {
	copyToClipboard(assignmentLink.innerText);
	copyLinkButton.innerText = 'Copied!';
	setTimeout(() => {
		copyLinkButton.innerText = 'Copy';
	}, 5000);
}
