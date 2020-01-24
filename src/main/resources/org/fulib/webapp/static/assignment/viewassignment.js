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

		for (let titleLabel of document.getElementsByClassName('assignment-title')) {
			titleLabel.innerText = result.title;
		}

		for (let authorLabel of document.getElementsByClassName('assignment-author')) {
			authorLabel.innerText = result.author;
		}

		for (let emailLabel of document.getElementsByClassName('assignment-email')) {
			emailLabel.innerText = result.email;
			emailLabel.href = `mailto:${result.email}`;
		}

		const deadlineText = new Date(result.deadline).toLocaleString();
		for (let deadlineLabel of document.getElementsByClassName('assignment-deadline')) {
			deadlineLabel.innerText = deadlineText;
		}

		for (let descriptionLabel of document.getElementsByClassName('assignment-description')) {
			if (result.descriptionHtml) {
				descriptionLabel.innerHTML = result.descriptionHtml;
			} else {
				descriptionLabel.innerText = result.description;
			}
		}

		for (let taskList of document.getElementsByClassName('assignment-task-list')) {
			removeChildren(taskList);
			for (let task of result.tasks) {
				const li = document.createElement('li');
				li.innerText = task.description;
				taskList.appendChild(li);
			}
		}
	});
}
