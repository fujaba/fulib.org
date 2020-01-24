// =============== Elements ===============

const solutionInput = document.getElementById('solutionInput');
const solutionInputCM = CodeMirror.fromTextArea(solutionInput, {
	theme: 'idea',
	mode: 'markdown',
	lineNumbers: true,
	lineWrapping: true,
	styleActiveLine: true,
});

// =============== Functions ===============

function autoUpdateEditorTheme() {
	try {
		// may fail if darktheme/network is unavailable
		updateEditorTheme();
		themeChangeHandlers.push(updateEditorTheme);
	} catch {}
}

function updateEditorTheme(theme = getTheme()) {
	let editorTheme = theme === 'dark' ? 'darcula' : 'idea';
	solutionInputCM.setOption('theme', editorTheme);
}

function getTokenHeaders() {
	return {
		'Assignment-Token': getAssignmentToken(assignmentID),
		'Solution-Token': getSolutionToken(assignmentID, solutionID),
	};
}

function getSolutionToken(assignmentID, solutionID) {
	return localStorage.getItem(`assignment/${assignmentID}/solution/${solutionID}/token`);
}

function setSolutionToken(assignmentID, solutionID, token) {
	localStorage.setItem(`assignment/${assignmentID}/solution/${solutionID}/token`, token);
}
