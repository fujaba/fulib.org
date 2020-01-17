const titleLabel = document.getElementById('titleLabel');
const authorLabel = document.getElementById('authorLabel');
const emailLabel = document.getElementById('emailLabel');
const deadlineLabel = document.getElementById('deadlineLabel');
const descriptionLabel = document.getElementById('descriptionLabel');

const solutionInput = document.getElementById('solutionInput');
const solutionInputCM = CodeMirror.fromTextArea(solutionInput, {
	theme: 'idea',
	mode: 'markdown',
	lineNumbers: true,
	lineWrapping: true,
	styleActiveLine: true,
});

const nameInput = document.getElementById('nameInput');
const studentIDInput = document.getElementById('studentIDInput');
const emailInput = document.getElementById('emailInput');

loadAssignment();

updateEditorTheme();
themeChangeHandlers.push(updateEditorTheme);

autoSave('assignment/view/',
	nameInput,
	studentIDInput,
	emailInput,
);

function updateEditorTheme(theme = getTheme()) {
	let editorTheme = theme === 'dark' ? 'darcula' : 'idea';
	solutionInputCM.setOption('theme', editorTheme);
}

function loadAssignment() {
	const url = new URL(window.location);
	const id = url.searchParams.get('id');

	api('GET', `/assignment/${id}`, null, result => {
		document.title = result.title;
		titleLabel.innerText = result.title;
		authorLabel.innerText = result.author;
		emailLabel.innerText = result.email;
		emailLabel.href = `mailto:${result.email}`;
		deadlineLabel.innerText = new Date(result.deadline).toLocaleString();
		descriptionLabel.innerText = result.description;
	});
}
