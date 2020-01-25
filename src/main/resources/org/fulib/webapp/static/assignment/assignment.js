// =============== Functions ===============

function getAssignmentIDFromURL() {
	return new URL(window.location).searchParams.get('id');
}

function getAssignmentToken(assignmentID) {
	return localStorage.getItem(`assignment/${assignmentID}/token`);
}

function setAssignmentToken(assignmentID, token) {
	localStorage.setItem(`assignment/${assignmentID}/token`, token);
}

function loadAssignment(id, resultHandler) {
	api('GET', `/assignment/${id}`, null, resultHandler);
}

function renderAssignment(assignment) {
	document.title = assignment.title;

	for (let titleLabel of document.getElementsByClassName('assignment-title')) {
		titleLabel.innerText = assignment.title;
	}

	for (let authorLabel of document.getElementsByClassName('assignment-author')) {
		authorLabel.innerText = assignment.author;
	}

	for (let emailLabel of document.getElementsByClassName('assignment-email')) {
		emailLabel.innerText = assignment.email;
		emailLabel.href = `mailto:${assignment.email}`;
	}

	const deadlineText = new Date(assignment.deadline).toLocaleString();
	for (let deadlineLabel of document.getElementsByClassName('assignment-deadline')) {
		deadlineLabel.innerText = deadlineText;
	}

	for (let descriptionLabel of document.getElementsByClassName('assignment-description')) {
		if (assignment.descriptionHtml) {
			descriptionLabel.innerHTML = assignment.descriptionHtml;
		} else {
			descriptionLabel.innerText = assignment.description;
		}
	}

	for (let taskList of document.getElementsByClassName('assignment-task-list')) {
		removeChildren(taskList);
		for (let task of assignment.tasks) {
			const li = document.createElement('li');
			li.innerText = task.description;
			taskList.appendChild(li);
		}
	}
}
