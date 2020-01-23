// =============== Elements ===============

const submitTimeStampDiv = document.getElementById('submitTimeStampDiv');
const submitTimeStampLabel = document.getElementById('submitTimeStampLabel');

const submitDiv = document.getElementById('submitDiv');

// =============== Fields ===============

const solutionID = new URL(window.location).searchParams.get('solution');

// =============== Initialization ===============

(() => {
	loadSolution();
})();

// =============== Functions ===============

function loadSolution() {
	if (!solutionID) {
		return;
	}

	const headers = {
		'Assignment-Token': localStorage.getItem(`assignment/${assignmentID}/token`),
	};
	apih('GET', `/assignment/${assignmentID}/solution/${solutionID}`, headers, null, result => {
		if (result.error) {
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
		submitTimeStampDiv.hidden = false;
		submitTimeStampLabel.innerText = new Date(result.timeStamp).toLocaleString();
	})
}
