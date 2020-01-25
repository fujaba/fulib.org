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

const assignmentID = getAssignmentIDFromURL();
const solutionID = getSolutionIDFromURL();

// =============== Initialization ===============

(() => {
	solutionInputCM.options.readOnly = true;

	autoUpdateEditorTheme();

	autoSave(`assignment/comment/`,
		commentNameInput,
		commentEmailInput,
	);

	loadAssignment(assignmentID, assignment => {
		renderAssignment(assignment);
		loadSolution(assignmentID, solutionID, renderSolution, error => {
			if (error === 'invalid token') {
				$('#tokenModal').modal('show');
			}
		});
		loadComments(assignmentID, solutionID, comments => {
			renderComments(commentList, comments);
		});
	});
})();

// =============== Functions ===============

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
	commentSubmitButton.innerText = 'Submitting Comment...';

	const headers = getTokenHeaders();
	apih('POST', `/assignment/${assignmentID}/solution/${solutionID}/comments`, headers, comment, result => {
		// fill server-generated fields
		comment.id = result.id;
		comment.timeStamp = result.timeStamp;
		comment.html = result.html;

		commentBodyInput.value = '';
		commentSubmitButton.innerText = 'Loading Your New Comment...';

		loadComments(() => {
			commentSubmitButton.disabled = false;
			commentSubmitButton.innerText = 'Submit Comment';
		});
	});
}
