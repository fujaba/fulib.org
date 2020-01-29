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

function ensureListChildren(elementList, count, render) {
	// remove extra child elements
	while (elementList.children.length > count) {
		elementList.removeChild(elementList.lastChild);
	}

	// add missing elements
	for (let index = elementList.children.length; index < count; index++) {
		elementList.insertAdjacentHTML('beforeend', render(index));
	}
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

function downloadJson(data, name) {
	const jsonStr = JSON.stringify(data, undefined, "  ");
	const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonStr)}`;
	const a = document.createElement('a');
	a.href = dataStr;
	a.download = `${name}.json`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

function readJson(file, handler) {
	const reader = new FileReader();
	reader.onload = event => {
		const text = event.target.result;
		const data = JSON.parse(text);
		handler(data);
	};
	reader.readAsText(file);
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

function delayedUpdate(codeMirror, delay, update) {
	let timeoutToken;
	codeMirror.on('changes', () => {
		clearTimeout(timeoutToken);
		timeoutToken = setTimeout(() => update(), delay);
	});
	codeMirror.on('blur', () => {
		clearTimeout(timeoutToken);
		update();
	});
}

function autoSaveCM(key, codeMirror, postHook = undefined) {
	codeMirror.setValue(localStorage.getItem(key) || '');

	delayedUpdate(codeMirror, 1000, () => {
		localStorage.setItem(key, codeMirror.getValue());
		if (postHook) {
			postHook();
		}
	});
}

function foldInternalCalls(outputLines, packageName) {
	const packageNamePrefix = `\tat ${packageName}.`;
	const result = [];
	let foldedLines = 0;
	for (let line of outputLines) {
		if (line.startsWith('\tat org.fulib.scenarios.tool.') ||
			line.startsWith('\tat ') && !line.startsWith('\tat org.fulib.') &&
			!line.startsWith(packageNamePrefix)) {
			foldedLines++;
		} else {
			if (foldedLines > 0) {
				result.push(foldedLines === 1 ? '\t(1 internal call)' : `\t(${foldedLines} internal calls)`);
				foldedLines = 0;
			}
			result.push(line);
		}
	}
	return result;
}

function absoluteLink(path) {
	const url = new URL(window.location);
	return `${url.protocol}//${url.host}${path}`
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
