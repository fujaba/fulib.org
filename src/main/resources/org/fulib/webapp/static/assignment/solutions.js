// ================ Elements ===============

const tokenInput = document.getElementById('tokenInput');

const searchInput = document.getElementById('searchInput');

const solutionList = document.getElementById('solutionList');

// =============== Variables ===============

const assignmentID = getAssignmentIDFromURL();

let assignment;
let solutions;

// =============== Initialization ===============

(() => {
	loadAssignment(assignmentID, result => {
		assignment = result;
		renderAssignment(result);
		loadSolutions();
	});
})();

// =============== Functions ===============

function submitToken() {
	setAssignmentToken(assignmentID, tokenInput.value);
	loadSolutions();
}

function loadSolutions() {
	const headers = {
		'Assignment-Token': getAssignmentToken(assignmentID),
	};
	apih('GET', `/assignment/${assignmentID}/solutions`, headers, null, result => {
		if (result.error === 'invalid token') {
			$('#tokenModal').modal('show');
			return;
		}

		solutions = result.solutions;

		renderSolutions(solutionList, solutions);
	});
}

function renderSolutions(elementList, solutions) {
	ensureListChildren(elementList, solutions.length, _ => `
		<div class="list-group-item list-group-item-action solution-item">
			<div>
				<span class="h5 solution-name-label">Loading...</span>
			</div>
			<div>
				<small>
					<span class="solution-studentid-label">Loading...</span>
					&mdash;
					<a class="solution-email-link">Loading...</a>
				</small>
			</div>
			<a class="solution-link">
				<span class="solution-timestamp-label">Loading...</span>
				<span class="badge badge-primary badge-pill solution-points-label">.../...</span>
			</a>
		</div>
		`
	);

	const nameLabels = elementList.getElementsByClassName('solution-name-label');
	const pointsLabels = document.getElementsByClassName(`solution-points-label`);
	const studentIDLabels = document.getElementsByClassName(`solution-studentid-label`);
	const emailLinks = document.getElementsByClassName(`solution-email-link`);
	const solutionLinks = document.getElementsByClassName(`solution-link`);
	const timeStampLabels = document.getElementsByClassName(`solution-timestamp-label`);

	const assignmentTotal = assignment.tasks.reduce((sum, task) => sum + task.points, 0);

	for (let index = 0; index < solutions.length; index++) {
		const solution = solutions[index];
		const total = computeTotalPoints(solution);

		nameLabels[index].innerText = solution.name;
		pointsLabels[index].innerText = `${total}/${assignmentTotal}`;
		studentIDLabels[index].innerText = solution.studentID;
		emailLinks[index].innerText = solution.email;
		emailLinks[index].href = `mailto:${solution.email}`;
		solutionLinks[index].href = `/assignment/${assignmentID}/solution/${solution.id}`;
		timeStampLabels[index].innerText = new Date(solution.timeStamp).toLocaleString();
	}
}

function computeTotalPoints(solution) {
	let total = 0;
	for (const result of solution.results) {
		total += result.points;
	}
	return total;
}

function updateSearch() {
	const searchText = searchInput.value;
	const searchWords = searchText.split(/\s+/);

	const solutionCount = solutionList.children.length;
	for (let index = 0; index < solutionCount; index++) {
		const link = document.getElementById(`solution${index}Item`);
		const solution = solutions[index];

		link.hidden = !includeInSearch(solution, searchWords);
	}
}

function includeInSearch({name, studentID, email}, searchWords) {
	for (const searchWord of searchWords) {
		if (name.indexOf(searchWord) >= 0 || studentID.indexOf(searchWord) >= 0 || email.indexOf(searchWord) >= 0) {
			return true;
		}
	}
	return false;
}
