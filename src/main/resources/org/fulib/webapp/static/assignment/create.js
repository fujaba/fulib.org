// =============== Elements ===============

const titleInput = document.getElementById('titleInput');
const authorInput = document.getElementById('authorInput');
const emailInput = document.getElementById('emailInput');
const deadlineDateInput = document.getElementById('deadlineDateInput');
const deadlineTimeInput = document.getElementById('deadlineTimeInput');
const descriptionInput = document.getElementById('descriptionInput');

const taskList = document.getElementById('taskList');

const submitButton = document.getElementById('submitButton');

const titleLabel = document.getElementById('titleLabel');
const assignmentLink = document.getElementById('assignmentLink');
const copyAssignmentLinkButton = document.getElementById('copyAssignmentLinkButton');
const solutionsLink = document.getElementById('solutionsLink');
const copySolutionsLinkButton = document.getElementById('solutionsLink');
const tokenLabel = document.getElementById('tokenLabel');
const copyTokenButton = document.getElementById('copyTokenButton');

const solutionInput = document.getElementById('solutionInput');
const solutionInputCM = CodeMirror.fromTextArea(solutionInput, {
	theme: 'idea',
	mode: 'markdown',
	lineNumbers: true,
	lineWrapping: true,
	styleActiveLine: true,
});

const verificationConfig = {
	theme: 'idea',
	mode: 'markdown',
	lineNumbers: true,
	lineWrapping: true,
	styleActiveLine: true,
};

// =============== Initialization ===============

(() => {
	try {
		// may fail if darktheme/network is unavailable
		updateEditorTheme();
		themeChangeHandlers.push(updateEditorTheme);
	} catch {}

	autoSave('assignment/create/',
		titleInput,
		authorInput,
		emailInput,
		deadlineDateInput,
		deadlineTimeInput,
		descriptionInput,
	);

	autoSaveCM('assignment/create/solutionInput', solutionInputCM);

	loadTasks();
})();

// =============== Functions ===============

function updateEditorTheme(theme = getTheme()) {
	let editorTheme = theme === 'dark' ? 'darcula' : 'idea';
	solutionInputCM.setOption('theme', editorTheme);
	verificationInputCM.setOption('theme', editorTheme);
}

function gatherData() {
	const data = {
		title: titleInput.value,
		author: authorInput.value,
		email: emailInput.value,
		deadline: new Date(deadlineDateInput.value + ' ' + deadlineTimeInput.value).toISOString(),
		description: descriptionInput.value,
		solution: solutionInputCM.getValue(),
		tasks: [],
	};

	for (let i = 0; i < nextTaskIndex; i++) {
		const listItem = document.getElementById('taskItem' + i);
		if (!listItem) {
			continue;
		}

		const descriptionInput = document.getElementById(`task/${i}/descriptionInput`);
		const pointsInput = document.getElementById(`task/${i}/pointsInput`);
		const verificationInput = document.getElementById(`task/${i}/verificationInput`);
		const verificationInputCM = verificationInput.codeMirror;

		data.tasks.push({
			description: descriptionInput.value,
			points: Number.parseInt(pointsInput.value),
			verification: verificationInputCM.getValue(),
		});
	}
	return data;
}

function loadData(data) {
	titleInput.value = data.title;
	authorInput.value = data.author;
	emailInput.value = data.email;
	const deadline = new Date(data.deadline);
	deadlineDateInput.value = deadline.toLocaleDateString();
	deadlineTimeInput.value = deadline.toLocaleTimeString();
	descriptionInput.value = data.description;
	solutionInputCM.setValue(data.solution);

	// TODO tasks
}

function submit() {
	submitButton.disabled = true;
	submitButton.innerText = 'Submitting...';

	const data = gatherData();

	api('POST', '/assignment', data, result => {
		const link = absoluteLink(`/assignment/${result.id}`);
		const solutionsLinkRef = link + '/solutions';

		submitButton.disabled = false;
		submitButton.innerText = 'Submit';

		titleLabel.innerText = titleInput.value;
		assignmentLink.href = link;
		assignmentLink.innerText = link;
		solutionsLink.href = solutionsLinkRef;
		solutionsLink.innerText = solutionsLinkRef;
		tokenLabel.innerText = result.token;
		localStorage.setItem(`assignment/${result.id}/token`, result.token);

		$('#successModal').modal('show');
	});
}

function animateCopyButton(button) {
	button.innerText = 'Copied!';
	setTimeout(() => button.innerText = 'Copy', 5000);
}

function onCopyAssignmentLink() {
	copyToClipboard(assignmentLink.innerText);
	animateCopyButton(copyAssignmentLinkButton);
}

function onCopySolutionsLink() {
	copyToClipboard(solutionsLink.innerText);
	animateCopyButton(copySolutionsLinkButton);
}

function onCopyToken() {
	copyToClipboard(tokenLabel.innerText);
	animateCopyButton(copyTokenButton);
}

// --------------- Tasks ---------------

function loadTaskIDs() {
	const taskIDString = localStorage.getItem('assignment/create/taskIDs');
	return taskIDString ? taskIDString.split(',').map(s => Number.parseInt(s)) : [];
}

function saveTaskIDs(indices) {
	localStorage.setItem('assignment/create/taskIDs', indices.join(','));
}

function newTaskID() {
	const taskIDs = loadTaskIDs();
	const newID = taskIDs.length === 0 ? 0 : taskIDs[taskIDs.length - 1] + 1;
	taskIDs.push(newID);
	saveTaskIDs(taskIDs);
	return newID;
}

function addTask(id = undefined) {
	if (typeof id === 'undefined') {
		id = newTaskID();
	}

	const html = `
	<li id="taskItem${id}">
		<form>
			<div class="form-group row">
				<label for="task/${id}/descriptionInput" class="col-sm-2 col-form-label">Description</label>
				<div class="col-sm-10">
					<input type="text" class="form-control" id="task/${id}/descriptionInput">
				</div>
			</div>
			<div class="form-group row">
				<label for="task/${id}/pointsInput" class="col-sm-2 col-form-label">Points</label>
				<div class="col-sm-10">
					<input type="number" class="form-control" id="task/${id}/pointsInput" min="0">
				</div>
			</div>
			<div class="form-group row">
				<label for="task/${id}/verificationInput" class="col-sm-2 col-form-label">Verification</label>
				<div class="col-sm-10">
					<textarea id="task/${id}/verificationInput"></textarea>
				</div>
			</div>
		</form>
		<button type="button" class="btn btn-danger" onclick="removeTask(${id})">Remove Task</button>
	</li>
	`;

	taskList.insertAdjacentHTML('beforeend', html);

	const descriptionInput = document.getElementById(`task/${id}/descriptionInput`);
	const pointsInput = document.getElementById(`task/${id}/pointsInput`);

	autoSave(`assignment/create/`,
		descriptionInput,
		pointsInput,
	);

	const verificationInput = document.getElementById(`task/${id}/verificationInput`);
	const verificationInputCM = CodeMirror.fromTextArea(verificationInput, verificationConfig);
	verificationInput.codeMirror = verificationInputCM;

	autoSaveCM(`assignment/create/task/${id}/verificationInput`, verificationInputCM);
}

function removeTask(id) {
	if (!confirm('Are you sure you want to remove this task?')) {
		return;
	}

	const taskItem = document.getElementById(`taskItem${id}`);
	taskList.removeChild(taskItem);

	for (const element of [ 'description', 'points', 'verification' ]) {
		localStorage.removeItem(`assignment/create/task/${id}/${element}Input`);
	}

	const taskIDs = loadTaskIDs();
	taskIDs.splice(taskIDs.indexOf(id), 1);
	saveTaskIDs(taskIDs);
}

function loadTasks() {
	const taskIDs = loadTaskIDs();
	removeChildren(taskList);
	for (const id of taskIDs) {
		addTask(id);
	}
}
