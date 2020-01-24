// =============== Elements ===============

const submitTimeStampLabel = document.getElementById('submitTimeStampLabel');

const commentList = document.getElementById('commentList');
const commentNameInput = document.getElementById('commentNameInput');
const commentEmailInput = document.getElementById('commentEmailInput');
const commentBodyInput = document.getElementById('commentBodyInput');
const commentSubmitButton = document.getElementById('commentSubmitButton');

const assignmentTokenInput = document.getElementById('assignmentTokenInput');
const solutionTokenInput = document.getElementById('solutionTokenInput');

// =============== Fields ===============

const solutionID = new URL(window.location).searchParams.get('solution');

// =============== Initialization ===============

(() => {
	solutionInputCM.options.readOnly = true;

	autoUpdateEditorTheme();

	autoSave(`assignment/comment/`,
		commentNameInput,
		commentEmailInput,
	);

	loadSolution();
	loadComments();
})();

// =============== Functions ===============

function loadSolution() {
	const headers = getTokenHeaders();
	apih('GET', `/assignment/${assignmentID}/solution/${solutionID}`, headers, null, result => {
		if (result.error === 'invalid token') {
			$('#tokenModal').modal('show');
			return;
		}

		solutionInputCM.setValue(result.solution);
		nameInput.value = result.name;
		emailInput.value = result.email;
		studentIDInput.value = result.studentID;
		submitTimeStampLabel.innerText = new Date(result.timeStamp).toLocaleString();
	});
}

function loadComments() {
	const headers = getTokenHeaders();
	apih('GET', `/assignment/${assignmentID}/solution/${solutionID}/comments`, headers, null, result => {
		renderComments(result.children);
	});
}

function renderComments(comments) {
	ensureListChildren(commentList, comments.length, _ => `
		<div class="card mb-3">
			<div class="card-header">
				<span class="comment-author"></span>
				&bullet;
				<a class="comment-email"></a>
				&bullet;
				<span class="comment-timestamp text-muted"></span>
			</div>
			<div class="card-body">
				<div class="card-text comment-body"></div>
			</div>
		</div>
		`
	);

	const authors = commentList.getElementsByClassName('comment-author');
	const emails = commentList.getElementsByClassName('comment-email');
	const timeStamps = commentList.getElementsByClassName('comment-timestamp');
	const bodies = commentList.getElementsByClassName('comment-body');

	for (let index = 0; index < comments.length; index++) {
		const comment = comments[index];

		authors[index].innerText = comment.author;
		emails[index].innerText = comment.email;
		emails[index].href = 'mailto:' + comment.email;
		timeStamps[index].innerText = new Date(comment.timeStamp).toLocaleString();
		bodies[index].innerHTML = comment.html;
	}
}

function submitToken() {
	const assignmentToken = assignmentTokenInput.value;
	const solutionToken = solutionTokenInput.value;

	if (assignmentToken) {
		setAssignmentToken(assignmentID, assignmentToken);
	}
	if (solutionToken && solutionID) {
		setSolutionToken(assignmentID, solutionID, solutionToken);
	}
}

function submitComment() {
	const comment = {
		author: commentNameInput.value,
		email: commentEmailInput.value,
		markdown: commentBodyInput.value,
	};

	commentSubmitButton.disabled = true;

	const headers = getTokenHeaders();
	apih('POST', `/assignment/${assignmentID}/solution/${solutionID}/comments`, headers, comment, result => {
		// fill server-generated fields
		comment.id = result.id;
		comment.timeStamp = result.timeStamp;
		comment.html = result.html;

		commentSubmitButton.disabled = false;
		commentBodyInput.value = '';

		loadComments();
	});
}
