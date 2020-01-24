// =============== Elements ===============

const nameInput = document.getElementById('nameInput');
const studentIDInput = document.getElementById('studentIDInput');
const emailInput = document.getElementById('emailInput');

const solutionInfo = document.getElementById('solutionInfo');

const submissionTimeLabel = document.getElementById('submissionTimeLabel');
const solutionLink = document.getElementById('solutionLink');
const tokenLabel = document.getElementById('tokenLabel');

// =============== Initialization ===============

(() => {
	autoUpdateEditorTheme();

	autoSave('assignment/view/',
		nameInput,
		studentIDInput,
		emailInput,
	);

	autoSaveCM('assignment/view/solutionInput', solutionInputCM, check);
})();

// =============== Functions ===============

function check() {
	solutionInfo.innerText = 'Checking...';

	const data = {
		solution: solutionInputCM.getValue(),
	};
	api('POST', `/assignment/${assignmentID}/check`, data, result => {
		for (let i = 0; i < result.tasks.length; i++) {
			console.log(task.output);

			for (const taskList of document.getElementsByClassName('assignment-task-list')) {
				const task = result.tasks[i];
				const taskItem = taskList.children[i];

				if (task.points === 0) {
					taskItem.classList.remove('text-success');
					taskItem.classList.add('text-danger');
				} else {
					taskItem.classList.remove('text-danger');
					taskItem.classList.add('text-success');
				}
			}
		}

		solutionInfo.innerText = 'Your solution was checked automatically. Don\'t forget to submit when you are done!';
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
