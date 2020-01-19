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
