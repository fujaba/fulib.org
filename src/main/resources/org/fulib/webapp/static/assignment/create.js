// =============== Elements ===============

const titleInput = document.getElementById('titleInput');
const authorInput = document.getElementById('authorInput');
const emailInput = document.getElementById('emailInput');
const deadlineDateInput = document.getElementById('deadlineDateInput');
const deadlineTimeInput = document.getElementById('deadlineTimeInput');
const descriptionInput = document.getElementById('descriptionInput');

const taskList = document.getElementById('taskList');

const titleLabel = document.getElementById('titleLabel');
const assignmentLink = document.getElementById('link');
const copyLinkButton = document.getElementById('copyLinkButton');
const tokenLabel = document.getElementById('tokenLabel');

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

// =============== Variables ===============

let nextTaskIndex = 0;

// =============== Initialization ===============

init();

function init() {
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
}

// =============== Functions ===============

function updateEditorTheme(theme = getTheme()) {
	let editorTheme = theme === 'dark' ? 'darcula' : 'idea';
	solutionInputCM.setOption('theme', editorTheme);
	verificationInputCM.setOption('theme', editorTheme);
}

function submit() {
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

		const descriptionInput = document.getElementById('taskDescriptionInput' + i);
		const pointsInput = document.getElementById('taskPointsInput' + i);
		const verificationInput = document.getElementById('taskVerificationInput' + i);
		const verificationInputCM = verificationInput.codeMirror;

		data.tasks.push({
			description: descriptionInput.value,
			points: Number.parseInt(pointsInput.value),
			verification: verificationInputCM.getValue(),
		});
	}

	api('POST', '/assignment', data, result => {
		const url = new URL(window.location);
		const link = `${url.protocol}//${url.host}/assignment/${result.id}`;
		titleLabel.innerText = titleInput.value;
		assignmentLink.href = link;
		assignmentLink.innerText = link;
		tokenLabel.innerText = result.token;
		$('#successModal').modal('show');
	});
}

function onCopyLink() {
	copyToClipboard(assignmentLink.innerText);
	copyLinkButton.innerText = 'Copied!';
	setTimeout(() => {
		copyLinkButton.innerText = 'Copy';
	}, 5000);
}

function addTask() {
	const index = nextTaskIndex++;
	const html = `
	<li id="taskItem${index}">
		<form>
			<div class="form-group row">
				<label for="taskDescriptionInput${index}" class="col-sm-2 col-form-label">Description</label>
				<div class="col-sm-10">
					<input type="text" class="form-control" id="taskDescriptionInput${index}">
				</div>
			</div>
			<div class="form-group row">
				<label for="taskPointsInput${index}" class="col-sm-2 col-form-label">Points</label>
				<div class="col-sm-10">
					<input type="number" class="form-control" id="taskPointsInput${index}" min="0">
				</div>
			</div>
			<div class="form-group row">
				<label for="taskVerificationInput${index}" class="col-sm-2 col-form-label">Verification</label>
				<div class="col-sm-10">
					<textarea id="taskVerificationInput${index}"></textarea>
				</div>
			</div>
		</form>
		<button type="button" class="btn btn-danger" onclick="removeTask(${index})">Remove Task</button>
	</li>
	`;

	taskList.insertAdjacentHTML('beforeend', html);

	const verificationInput = document.getElementById('taskVerificationInput' + index);
	verificationInput.codeMirror = CodeMirror.fromTextArea(verificationInput, verificationConfig);
}

function removeTask(index) {
	const taskItem = document.getElementById('taskItem' + index);
	taskList.removeChild(taskItem);
}
