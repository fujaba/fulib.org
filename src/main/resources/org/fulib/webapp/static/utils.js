function api(method, url, body, handler) {
	apih(method, url, null, body, handler);
}

function apih(method, url, headers, body, handler) {
	const requestBody = JSON.stringify(body);
	const request = new XMLHttpRequest();

	request.overrideMimeType('application/json');
	request.addEventListener('load', function() {
		handler(JSON.parse(this.responseText));
	});
	request.open(method, url, true);
	request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	if (headers) {
		for (const headerName of Object.keys(headers)) {
			request.setRequestHeader(headerName, headers[headerName]);
		}
	}
	request.send(requestBody);
}

function removeChildren(element) {
	while (element.firstChild) {
		element.firstChild.remove();
	}
}

function copyToClipboard(text) {
	const textArea = document.createElement('textarea');
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.select();
	document.execCommand('copy');
	document.body.removeChild(textArea);
}

function autoSave(prefix, ...elements) {
	for (const element of elements) {
		const key = prefix + element.id;
		const stored = localStorage.getItem(key);
		if (stored) {
			element.value = stored;
		}
		element.onchange = () => localStorage.setItem(key, element.value);
	}

}

function addTab(tabHolder, contentHolder, id, header, content) {
	// https://getbootstrap.com/docs/4.0/components/navs/#javascript-behavior

	// tab header

	const li = document.createElement('li');
	li.className = 'nav-item';

	const a = document.createElement('a');
	a.className = 'nav-link';
	a.id = 'tab-' + id;
	a.href = '#content-' + id;
	a.innerText = header;
	a.setAttribute('role', 'tab');
	a.setAttribute('data-toggle', 'tab');
	a.setAttribute('aria-controls', 'content-' + id);
	a.setAttribute('aria-selected', 'false');

	li.appendChild(a);

	tabHolder.appendChild(li);

	// tab content

	const div = document.createElement('div');
	div.classList.add('tab-pane', 'fade');
	div.id = 'content-' + id;
	div.setAttribute('role', 'tabpanel');
	div.setAttribute('aria-labelledby', 'tab-' + id);

	div.appendChild(content);

	contentHolder.appendChild(div);
}
