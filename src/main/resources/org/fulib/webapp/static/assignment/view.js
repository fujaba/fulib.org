// =============== Elements ===============

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

const taskList = document.getElementById('taskList');

const nameInput = document.getElementById('nameInput');
const studentIDInput = document.getElementById('studentIDInput');
const emailInput = document.getElementById('emailInput');

// =============== Variables ===============

const assignmentID = new URL(window.location).searchParams.get('id');

// =============== Initialization ===============

init();

function init() {
	loadAssignment();

	try {
		// may fail if darktheme/network is unavailable
		updateEditorTheme();
		themeChangeHandlers.push(updateEditorTheme);
	} catch {}

	autoSave('assignment/view/',
		nameInput,
		studentIDInput,
		emailInput,
	);
}

// =============== Functions ===============

function updateEditorTheme(theme = getTheme()) {
	let editorTheme = theme === 'dark' ? 'darcula' : 'idea';
	solutionInputCM.setOption('theme', editorTheme);
}

function loadAssignment() {
	api('GET', `/assignment/${assignmentID}`, null, result => {
		document.title = result.title;
		titleLabel.innerText = result.title;
		authorLabel.innerText = result.author;
		emailLabel.innerText = result.email;
		emailLabel.href = `mailto:${result.email}`;
		deadlineLabel.innerText = new Date(result.deadline).toLocaleString();
		descriptionLabel.innerText = result.description;

		removeChildren(taskList);
		for (let task of result.tasks) {
			const li = document.createElement('li');
			li.innerText = task.description;
			taskList.appendChild(li);
		}
	});
}

function submit() {
	const data = {
		assignmentID: assignmentID,
		name: nameInput.value,
		studentID: studentIDInput.value,
		email: emailInput.value,
		solution: solutionInputCM.getValue(),
	};

	api('POST', `/assignment/${assignmentID}/solution`, data, result => {
		$('#successModal').modal('show');
	});
}
