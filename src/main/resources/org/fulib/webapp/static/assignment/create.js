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

// =============== Variables ===============

let nextTaskIndex = 0;

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

	function hasSavedTask(index) {
		for (const id of [ 'Description', 'Points', 'Verification' ]) {
			if (localStorage.getItem(`assignment/create/task${id}Input${index}`)) {
				return true;
			}
		}
		return false;
	}

	for (let i = 0; ; i++) {
		if (hasSavedTask(i)) {
			addTask();
		} else {
			break;
		}
	}
})();

// =============== Functions ===============

function updateEditorTheme(theme = getTheme()) {
	let editorTheme = theme === 'dark' ? 'darcula' : 'idea';
	solutionInputCM.setOption('theme', editorTheme);
	verificationInputCM.setOption('theme', editorTheme);
}

function submit() {
	submitButton.disabled = true;
	submitButton.innerText = 'Submitting...';

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

	const descriptionInput = document.getElementById(`taskDescriptionInput${index}`);
	const pointsInput = document.getElementById(`taskPointsInput${index}`);

	autoSave(`assignment/create/`,
		descriptionInput,
		pointsInput,
	);

	const verificationInput = document.getElementById(`taskVerificationInput${index}`);
	const verificationInputCM = CodeMirror.fromTextArea(verificationInput, verificationConfig);
	verificationInput.codeMirror = verificationInputCM;

	autoSaveCM(`assignment/create/taskVerificationInput${index}`, verificationInputCM);
}

function removeTask(index) {
	const taskItem = document.getElementById('taskItem' + index);
	taskList.removeChild(taskItem);

	for (const id of [ 'Description', 'Points', 'Verification' ]) {
		localStorage.removeItem(`assignment/create/task${id}Input${index}`);
	}
}
