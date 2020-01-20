// ================ Elements ===============

const tokenInput = document.getElementById('tokenInput');

const searchInput = document.getElementById('searchInput');

const solutionList = document.getElementById('solutionList');

// =============== Variables ===============

let solutions;

// =============== Initialization ===============

(() => {
	loadSolutions();
})();

// =============== Functions ===============

function getToken() {
	return localStorage.getItem(`assignment/${assignmentID}/token`);
}

function setToken(token) {
	localStorage.setItem(`assignment/${assignmentID}/token`, token);
}

function submitToken() {
	setToken(tokenInput.value);
	loadSolutions();
}

function loadSolutions() {
	const headers = {
		'Assignment-Token': getToken(),
	};
	apih('GET', `/assignment/${assignmentID}/solutions`, headers, null, result => {
		if (result.error === 'invalid token') {
			$('#tokenModal').modal('show');
			return;
		}

		solutions = result.solutions;

		removeChildren(solutionList);
		for (let index = 0; index < solutions.length; index++) {
			const solution = solutions[index];
			const html = `
			<div id="solution${index}Item" class="list-group-item list-group-item-action">
				<div>
					<span class="h5" id="solution${index}NameLabel">Loading...</span>
				</div>
				<div>
					<small>
						<span id="solution${index}StudentIDLabel">Loading...</span>
						&mdash;
						<a id="solution${index}EmailLink">Loading...</a>
					</small>
				</div>
				<a id="solution${index}Link">
					<span id="solution${index}TimeStampLabel">Loading...</span>
					<span class="badge badge-primary badge-pill" id="solution${index}PointsLabel">.../...</span>
				</a>
			</div>
			`;
			solutionList.insertAdjacentHTML('beforeend', html);

			const solutionNameLabel = document.getElementById(`solution${index}NameLabel`);
			const solutionPointsLabel = document.getElementById(`solution${index}PointsLabel`);
			const solutionStudentIDLabel = document.getElementById(`solution${index}StudentIDLabel`);
			const solutionEmailLink = document.getElementById(`solution${index}EmailLink`);
			const solutionLink = document.getElementById(`solution${index}Link`);
			const solutionTimeStampLabel = document.getElementById(`solution${index}TimeStampLabel`);

			solutionNameLabel.innerText = solution.name;
			solutionPointsLabel.innerText = 'X/X'; // TODO
			solutionStudentIDLabel.innerText = solution.studentID;
			solutionEmailLink.innerText = solution.email;
			solutionEmailLink.href = `mailto:${solution.email}`;
			solutionLink.href = `/assignment/${assignmentID}/solution/${solution.id}`;
			solutionTimeStampLabel.innerText = new Date(solution.timeStamp).toLocaleString();
		}
	});
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
