// =============== Elements ===============

const titleLabel = document.getElementById('titleLabel');
const authorLabel = document.getElementById('authorLabel');
const emailLabel = document.getElementById('emailLabel');
const deadlineLabel = document.getElementById('deadlineLabel');
const descriptionLabel = document.getElementById('descriptionLabel');

const taskList = document.getElementById('taskList');

const submitDiv = document.getElementById('submitDiv');

// =============== Variables ===============

const assignmentID = new URL(window.location).searchParams.get('id');
const solutionID = new URL(window.location).searchParams.get('solution');

// =============== Initialization ===============

(() => {
	loadAssignment();
	loadSolution();
})();

// =============== Functions ===============

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
	})
}
