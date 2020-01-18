// ================ Elements ===============

const studentList = document.getElementById('solutionList');

// =============== Initialization ===============

(() => {
	loadSolutions();
})();

// =============== Functions ===============

function loadSolutions() {
	api('GET', `/assignment/${assignmentID}/solutions`, null, result => {
		const solutions = result.solutions;

		removeChildren(studentList);
		for (let index = 0; index < solutions.length; index++) {
			const solution = solutions[index];
			const html = `
			<div id="solution${index}Link" class="list-group-item list-group-item-action">
				<h5 id="solution${index}NameLabel">Loading...</h5>
				<span class="badge badge-primary badge-pill" id="solution${index}PointsLabel">.../...</span>
				<p class="mb-1">
					<span id="solution${index}StudentIDLabel">Loading...</span>
					&mdash;
					<a id="solution${index}EmailLink">Loading...</a>
				</p>
				<small id="solution${index}TimeStampLabel">Loading...</small>
			</div>
			`;
			studentList.insertAdjacentHTML('beforeend', html);

			const solutionLink = document.getElementById(`solution${index}Link`);
			const solutionNameLabel = document.getElementById(`solution${index}NameLabel`);
			const solutionPointsLabel = document.getElementById(`solution${index}PointsLabel`);
			const solutionStudentIDLabel = document.getElementById(`solution${index}StudentIDLabel`);
			const solutionEmailLink = document.getElementById(`solution${index}EmailLink`);
			const solutionTimeStampLabel = document.getElementById(`solution${index}TimeStampLabel`);

			// TODO solutionLink.href
			solutionNameLabel.innerText = solution.name;
			solutionPointsLabel.innerText = 'X/X'; // TODO
			solutionStudentIDLabel.innerText = solution.studentID;
			solutionEmailLink.innerText = solution.email;
			solutionEmailLink.href = `mailto:${solution.email}`;
			solutionTimeStampLabel.innerText = new Date(solution.timeStamp).toLocaleString();
		}
	});
}
