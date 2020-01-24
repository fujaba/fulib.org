// =============== Elements ===============

const titleLabel = document.getElementById('titleLabel');
const authorLabel = document.getElementById('authorLabel');
const emailLabel = document.getElementById('emailLabel');
const deadlineLabel = document.getElementById('deadlineLabel');
const descriptionLabel = document.getElementById('descriptionLabel');

const taskList = document.getElementById('taskList');

// =============== Variables ===============

const assignmentID = new URL(window.location).searchParams.get('id');

// =============== Initialization ===============

(() => {
	loadAssignment();
})();

// =============== Functions ===============

function getAssignmentToken(assignmentID) {
	return localStorage.getItem(`assignment/${assignmentID}/token`);
}

function setAssignmentToken(assignmentID, token) {
	localStorage.setItem(`assignment/${assignmentID}/token`, token);
}

function loadAssignment() {
	api('GET', `/assignment/${assignmentID}`, null, result => {
		document.title = result.title;
		titleLabel.innerText = result.title;
		authorLabel.innerText = result.author;
		emailLabel.innerText = result.email;
		emailLabel.href = `mailto:${result.email}`;
		deadlineLabel.innerText = new Date(result.deadline).toLocaleString();

		if (result.descriptionHtml) {
			descriptionLabel.innerHTML = result.descriptionHtml;
		}
		else {
			descriptionLabel.innerText = result.description;
		}

		removeChildren(taskList);
		for (let task of result.tasks) {
			const li = document.createElement('li');
			li.innerText = task.description;
			taskList.appendChild(li);
		}
	});
}
