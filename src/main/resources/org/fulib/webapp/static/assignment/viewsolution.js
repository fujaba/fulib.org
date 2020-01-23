// =============== Elements ===============

const viewSolutionDiv = document.getElementById('viewSolutionDiv');
const submitTimeStampLabel = document.getElementById('submitTimeStampLabel');

const submitDiv = document.getElementById('submitDiv');

const assignmentTokenInput = document.getElementById('assignmentTokenInput');
const solutionTokenInput = document.getElementById('solutionTokenInput');

// =============== Fields ===============

const solutionID = new URL(window.location).searchParams.get('solution');

// =============== Initialization ===============

(() => {
	loadSolution();
})();

// =============== Functions ===============

function getSolutionToken(assignmentID, solutionID) {
	return localStorage.getItem(`assignment/${assignmentID}/solution/${solutionID}/token`);
}

function setSolutionToken(assignmentID, solutionID, token) {
	localStorage.setItem(`assignment/${assignmentID}/solution/${solutionID}/token`, token);
}

function loadSolution() {
	if (!solutionID) {
		return;
	}

	const headers = {
		'Assignment-Token': getAssignmentToken(assignmentID),
		'Solution-Token': getSolutionToken(assignmentID, solutionID),
	};
	apih('GET', `/assignment/${assignmentID}/solution/${solutionID}`, headers, null, result => {
		if (result.error === 'invalid token') {
			$('#tokenModal').modal('show');
			return;
		}

		solutionInputCM.setValue(result.solution);
		nameInput.value = result.name;
		emailInput.value = result.email;
		studentIDInput.value = result.studentID;

		solutionInputCM.options.readOnly = true;
		nameInput.readOnly = true;
		emailInput.readOnly = true;
		studentIDInput.readOnly = true;

		submitDiv.hidden = true;
		viewSolutionDiv.hidden = false;
		submitTimeStampLabel.innerText = new Date(result.timeStamp).toLocaleString();
	});
}

function submitToken() {
	const assignmentToken = assignmentTokenInput.value;
	const solutionToken = solutionTokenInput.value;

	if (assignmentToken) {
		setAssignmentToken(assignmentID, assignmentToken);
	}
	if (solutionToken && solutionID) {
		setSolutionToken(assignmentID, solutionID, solutionToken);
	}
}
