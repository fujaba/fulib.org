// =============== Elements ===============

const viewSolutionDiv = document.getElementById('viewSolutionDiv');
const submitTimeStampLabel = document.getElementById('submitTimeStampLabel');

const submitDiv = document.getElementById('submitDiv');

const commentList = document.getElementById('commentList');
const commentNameInput = document.getElementById('commentNameInput');
const commentEmailInput = document.getElementById('commentEmailInput');
const commentBodyInput = document.getElementById('commentBodyInput');

const assignmentTokenInput = document.getElementById('assignmentTokenInput');
const solutionTokenInput = document.getElementById('solutionTokenInput');

// =============== Fields ===============

const solutionID = new URL(window.location).searchParams.get('solution');

// =============== Initialization ===============

(() => {
	loadSolution();
})();

// =============== Functions ===============

function getSolutionToken(assignmentID, solutionID) {
	return localStorage.getItem(`assignment/${assignmentID}/solution/${solutionID}/token`);
}

function setSolutionToken(assignmentID, solutionID, token) {
	localStorage.setItem(`assignment/${assignmentID}/solution/${solutionID}/token`, token);
}

function loadSolution() {
	if (!solutionID) {
		return;
	}

	const headers = {
		'Assignment-Token': getAssignmentToken(assignmentID),
		'Solution-Token': getSolutionToken(assignmentID, solutionID),
	};
	apih('GET', `/assignment/${assignmentID}/solution/${solutionID}`, headers, null, result => {
		if (result.error === 'invalid token') {
			$('#tokenModal').modal('show');
			return;
		}

		solutionInputCM.setValue(result.solution);
		nameInput.value = result.name;
		emailInput.value = result.email;
		studentIDInput.value = result.studentID;

		solutionInputCM.options.readOnly = true;
		nameInput.readOnly = true;
		emailInput.readOnly = true;
		studentIDInput.readOnly = true;

		submitDiv.hidden = true;
		viewSolutionDiv.hidden = false;
		submitTimeStampLabel.innerText = new Date(result.timeStamp).toLocaleString();
	});

	apih('GET', `/assignment/${assignmentID}/solution/${solutionID}/comments`, headers, null, result => {
		renderComments(result.children);
	});
}

function renderComments(comments) {
	ensureListChildren(commentList, comments.length, _ => `
		<div class="card mb-3">
			<div class="card-header">
				<div class="d-flex w-100 justify-content-between">
					<span class="comment-author"></span>
					<span class="comment-timestamp"></span>
				</div>
			</div>
			<div class="card-body">
				<div class="card-text comment-body"></div>
			</div>
		</div>
		`
	);

	const authors = commentList.getElementsByClassName('comment-author');
	const timeStamps = commentList.getElementsByClassName('comment-timestamp');
	const bodies = commentList.getElementsByClassName('comment-body');

	for (let index = 0; index < comments.length; index++) {
		const comment = comments[index];

		authors[index].innerText = comment.author;
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

	const headers = {
		'Assignment-Token': getAssignmentToken(assignmentID),
		'Solution-Token': getSolutionToken(assignmentID, solutionID),
	};
	apih('POST', `/assignment/${assignmentID}/solution/${solutionID}/comments`, headers, comment, result => {
		// fill server-generated fields
		comment.id = result.id;
		comment.timeStamp = result.timeStamp;
		comment.html = result.html;

		// TODO add to list
	});
}
