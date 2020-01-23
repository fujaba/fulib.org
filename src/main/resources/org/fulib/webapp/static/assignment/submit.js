// =============== Elements ===============

const nameInput = document.getElementById('nameInput');
const studentIDInput = document.getElementById('studentIDInput');
const emailInput = document.getElementById('emailInput');

const solutionInput = document.getElementById('solutionInput');
const solutionInputCM = CodeMirror.fromTextArea(solutionInput, {
	theme: 'idea',
	mode: 'markdown',
	lineNumbers: true,
	lineWrapping: true,
	styleActiveLine: true,
});

const submissionTimeLabel = document.getElementById('submissionTimeLabel');
const solutionLink = document.getElementById('solutionLink');
const tokenLabel = document.getElementById('tokenLabel');

// =============== Initialization ===============

(() => {
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
})();

// =============== Functions ===============

function updateEditorTheme(theme = getTheme()) {
	let editorTheme = theme === 'dark' ? 'darcula' : 'idea';
	solutionInputCM.setOption('theme', editorTheme);
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
		const timeStamp = new Date(result.timeStamp);
		submissionTimeLabel.innerText = timeStamp.toLocaleString();

		const link = absoluteLink(`/assignment/${assignmentID}/solution/${(result.id)}`);
		solutionLink.innerText = link;
		solutionLink.href = link;

		tokenLabel.innerText = result.token;
		setSolutionToken(assignmentID, result.id, result.token);

		$('#successModal').modal('show');
	});
}
