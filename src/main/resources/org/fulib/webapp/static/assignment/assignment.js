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
	api('GET', `/assignments/${id}`, null, resultHandler);
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

	for (const taskList of document.getElementsByClassName('assignment-task-list')) {
		ensureListChildren(taskList, assignment.tasks.length, index => `
		<li>
			<span class="assignment-task-description" data-task-index="${index}"></span>
			
			<span class="badge badge-secondary assignment-task-points" data-task-index="${index}"></span>
		</li>
		`);
	}

	for (const descriptionLabel of document.getElementsByClassName('assignment-task-description')) {
		const index = descriptionLabel.dataset.taskIndex;
		const task = assignment.tasks[index];
		descriptionLabel.innerText = task.description;
	}

	for (const pointsLabel of document.getElementsByClassName('assignment-task-points')) {
		const index = pointsLabel.dataset.taskIndex;
		const task = assignment.tasks[index];
		pointsLabel.innerText = task.points;
	}
}
