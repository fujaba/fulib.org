// =============== Functions ===============

function loadComments(assignmentID, solutionID, handler) {
	const headers = getTokenHeaders();
	apih('GET', `/assignments/${assignmentID}/solutions/${solutionID}/comments`, headers, null, result => {
		handler(result.children);
	});
}

function renderComments(listElement, comments) {
	ensureListChildren(listElement, comments.length, _ => `
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

	const authors = listElement.getElementsByClassName('comment-author');
	const emails = listElement.getElementsByClassName('comment-email');
	const timeStamps = listElement.getElementsByClassName('comment-timestamp');
	const bodies = listElement.getElementsByClassName('comment-body');

	for (let index = 0; index < comments.length; index++) {
		const comment = comments[index];

		authors[index].innerText = comment.author;
		emails[index].innerText = comment.email;
		emails[index].href = 'mailto:' + comment.email;
		timeStamps[index].innerText = new Date(comment.timeStamp).toLocaleString();
		bodies[index].innerHTML = comment.html;
	}
}
