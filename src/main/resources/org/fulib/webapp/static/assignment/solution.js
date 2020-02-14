// =============== Elements ===============

const solutionInput = document.getElementById('solutionInput');
const solutionInputCM = CodeMirror.fromTextArea(solutionInput, {
	...solutionInputConfig,
	readOnly: true,
});

const submitTimeStampLabel = document.getElementById('submitTimeStampLabel');

const commentList = document.getElementById('commentList');
const commentNameInput = document.getElementById('commentNameInput');
const commentEmailInput = document.getElementById('commentEmailInput');
const commentBodyInput = document.getElementById('commentBodyInput');
const commentSubmitButton = document.getElementById('commentSubmitButton');

const assignmentTokenInput = document.getElementById('assignmentTokenInput');
const solutionTokenInput = document.getElementById('solutionTokenInput');

const gradingNameInput = document.getElementById('gradingNameInput');
const gradingPointsInput = document.getElementById('gradingPointsInput');
const gradingNoteInput = document.getElementById('gradingNoteInput');

// =============== Fields ===============

const assignmentID = getAssignmentIDFromURL();
const solutionID = getSolutionIDFromURL();

// =============== Initialization ===============

(() => {
	autoUpdateEditorTheme(solutionInputCM);

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
	apih('POST', `/assignments/${assignmentID}/solutions/${solutionID}/comments`, headers, comment, result => {
		// fill server-generated fields
		comment.id = result.id;
		comment.timeStamp = result.timeStamp;
		comment.html = result.html;

		commentBodyInput.value = '';
		commentSubmitButton.innerText = 'Loading Your New Comment...';

		loadComments(assignmentID, solutionID, comments => {
			renderComments(commentList, comments);
			commentSubmitButton.disabled = false;
			commentSubmitButton.innerText = 'Submit Comment';
		});
	});
}

function submitGrading() {
	const headers = {
		'Assignment-Token': getAssignmentToken(assignmentID),
	};
	const data = {
		author: gradingNameInput.value,
		points: gradingPointsInput.value,
		note: gradingPointsInput.value,
	};
	apih('POST', `/assignments/${assignmentID}/solutions/${solutionID}/corrections`, headers, data, result => {
	});
}
