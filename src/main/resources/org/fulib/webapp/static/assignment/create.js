const titleInput = document.getElementById('titleInput');
const authorInput = document.getElementById('authorInput');
const emailInput = document.getElementById('emailInput');
const deadlineDateInput = document.getElementById('deadlineDateInput');
const deadlineTimeInput = document.getElementById('deadlineTimeInput');
const descriptionInput = document.getElementById('descriptionInput');

const assignmentLink = document.getElementById('link');

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

updateEditorTheme();
themeChangeHandlers.push(updateEditorTheme);

for (const element of [
	titleInput,
	authorInput,
	emailInput,
	deadlineDateInput,
	deadlineTimeInput,
	descriptionInput,
]) {
	const key = 'assignment/create/' + element.id;
	const stored = localStorage.getItem(key);
	if (stored) {
		element.value = stored;
	}
	element.onchange = () => localStorage.setItem(key, element.value);
}

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
		const id = result.id;
		const link = `https://www.fulib.org/assignment/${id}`;
		assignmentLink.href = link;
		assignmentLink.innerText = link;
		$('#successModal').modal('show');
	});
}
