// =============== Constants ===============

const apiUrl = '';

const persistenceKeys = {
	privacy: 'privacy',
	storedScenario: 'storedScenario',
	selectedExample: 'selectedExample',
	packageName: 'packageName',
	scenarioFileName: 'scenarioFileName',
	projectName: 'projectName',
	projectVersion: 'projectVersion',
};

const defaults = {
	scenarioText: `# My First Scenario

// start typing your scenario or select an example using the dropdown above.

There is a Car with name Herbie.
`,
	packageName: 'org.example',
	scenarioFileName: 'Scenario.md',
	projectName: 'scenario',
	projectVersion: '0.1.0',
};

const examples = [
	'Definitions', [
		'Basics',
		'Simple Definitions',
		'Complex Definitions',
		'Associations',
		'Special Associations',
	],
	'Testing', [
		'Expectations',
		'Relational Operators',
		'Object Diagrams',
	],
	'Methods', [
		'Calling Methods',
		'Passing Arguments',
		'Piecewise Definition',
	],
	'Transformation', [
		'Lists',
		'Modifying Data',
		'Conditionals',
		'Loops',
	],
];

const exampleSelect = document.getElementById('exampleSelect');
const exampleWarning = document.getElementById('exampleWarning');

const scenarioInput = document.getElementById('scenarioInput');
const scenarioInputCodeMirror = CodeMirror.fromTextArea(scenarioInput, {
	theme: 'idea',
	mode: 'markdown',
	lineNumbers: true,
	lineWrapping: true,
	styleActiveLine: true,
	extraKeys: {
		'Ctrl-Enter': submit,
		'Cmd-Enter': submit,
		'Ctrl-S': submit,
		'Cmd-S': submit,
	},
});

const javaTestOutput = document.getElementById('javaTestOutput');
const javaTestOutputCodeMirror = CodeMirror.fromTextArea(javaTestOutput, {
	theme: 'idea',
	lineNumbers: true,
	matchBrackets: true,
	readOnly: true,
	mode: 'text/x-java',
});

const scenarioCompileProgress = document.getElementById('scenarioCompileProgress');
const modelCompileProgress = document.getElementById('modelCompileProgress');
const testCompileProgress = document.getElementById('testCompileProgress');
const testRunProgress = document.getElementById('testRunProgress');
const progressElements = [scenarioCompileProgress, testCompileProgress, modelCompileProgress, testRunProgress];

const objectDiagrams = document.getElementById('objectDiagrams');
const objectDiagramTab = document.getElementById('objectDiagramTab');
const objectDiagramTabContent = document.getElementById('objectDiagramTabContent');
const classDiagram = document.getElementById('classDiagram');

const packageNameField = document.getElementById('packageNameField');
const scenarioFileNameField = document.getElementById('scenarioFileNameField');
const projectNameField = document.getElementById('projectNameField');
const projectVersionField = document.getElementById('projectVersionField');

const darkSwitch = document.getElementById('darkSwitch');

// =============== Variables ===============

let selectedExample;

// =============== Initialization ===============

init();

function init() {
	loadPrivacy();
	loadConfig();
	loadExamples();
	loadStoredExample();
	loadTheme();

	// enable tooltips
	$(function() {
		$('[data-toggle="tooltip"]').tooltip();
	});
}

// =============== Functions ===============

// --------------- Privacy ---------------

function loadPrivacy() {
	let privacy = localStorage.getItem(persistenceKeys.privacy);

	if (!privacy) {
		privacy = 'none';
		$('#privacyModal').modal('show');
	}

	console.log('loaded privacy: ' + privacy);
	document.getElementById('privacy-' + privacy).checked = true;
}

function savePrivacy() {
	let value = $('input[name=privacy]:checked').val();

	console.log('setting privacy: ' + value);
	if (value === 'none') {
		localStorage.clear();
	} else if (value === 'nobanner') {
		localStorage.clear();
		localStorage.setItem(persistenceKeys.privacy, value);
	} else {
		localStorage.setItem(persistenceKeys.privacy, value);
	}
}

function getPrivacy() {
	return localStorage.getItem(persistenceKeys.privacy) || 'none';
}

function trySetStorage(key, value) {
	let privacy = localStorage.getItem(persistenceKeys.privacy);
	if (privacy === 'all' || privacy === 'local') {
		localStorage.setItem(key, value);
	}
}

// --------------- Config ---------------

function loadConfig() {
	packageNameField.value = localStorage.getItem(persistenceKeys.packageName) || defaults.packageName;
	scenarioFileNameField.value = localStorage.getItem(persistenceKeys.scenarioFileName) || defaults.scenarioFileName;
	projectNameField.value = localStorage.getItem(persistenceKeys.projectName) || defaults.projectName;
	projectVersionField.value = localStorage.getItem(persistenceKeys.projectVersion) || defaults.projectVersion;
}

function saveConfig() {
	trySetStorage(persistenceKeys.packageName, packageNameField.value || defaults.packageName);
	trySetStorage(persistenceKeys.scenarioFileName, scenarioFileNameField.value || defaults.scenarioFileName);
	trySetStorage(persistenceKeys.projectName, projectNameField.value || defaults.projectName);
	trySetStorage(persistenceKeys.projectVersion, projectVersionField.value || defaults.projectVersion);
}

// --------------- Submit ---------------

function submit() {
	const text = scenarioInputCodeMirror.getValue();

	if (!selectedExample) {
		trySetStorage(persistenceKeys.storedScenario, text);
	}

	removeChildren(objectDiagrams);
	removeChildren(objectDiagramTab);
	removeChildren(objectDiagramTabContent);
	removeChildren(classDiagram);

	javaTestOutputCodeMirror.setValue('// loading...');
	objectDiagrams.innerText = 'loading...';
	classDiagram.innerText = 'loading...';

	const requestBody = {
		privacy: getPrivacy(),
		packageName: packageNameField.value || defaults.packageName,
		scenarioFileName: scenarioFileNameField.value || defaults.scenarioFileName,
		scenarioText: text,
		selectedExample: selectedExample,
	};

	api('POST', apiUrl + '/runcodegen', requestBody, handleResponse);
}

function handleResponse(response) {
	function foldInternalCalls(outputLines) {
		const packageNamePrefix = `\tat ${(packageNameField.value || defaults.packageName).replace('/', '.')}.`;
		const result = [];
		let counter = 0;
		for (let line of outputLines) {
			if (line.startsWith('\tat org.fulib.scenarios.tool.') ||
				line.startsWith('\tat ') && !line.startsWith('\tat org.fulib.') &&
				!line.startsWith(packageNamePrefix)) {
				counter++;
			} else {
				if (counter > 0) {
					result.push(counter === 1 ? '\t(1 internal call)' : '\t(' + counter + ' internal calls)');
					counter = 0;
				}
				result.push(line);
			}
		}
		return result;
	}

	console.log(response.output);
	console.log('exit code: ' + response.exitCode);

	let javaCode = '';
	if (response.exitCode !== 0) {
		javaCode += foldInternalCalls(response.output.split('\n')).map(function(line) {
			return '// ' + line;
		}).join('\n') + '\n';
		setFailure(response.exitCode & 3);
	} else {
		setFailure(progressElements.length);
	}

	if (response.testMethods) {
		for (testMethod of response.testMethods) {
			javaCode += `// --------------- ${testMethod.name} in class ${testMethod.className} ---------------\n\n`;
			javaCode += testMethod.body;
			javaCode += '\n';
		}
	}
	javaTestOutputCodeMirror.setValue(javaCode);

	removeChildren(classDiagram);
	classDiagram.innerHTML = response.classDiagram || 'No model classes to display.';

	displayObjectDiagrams(response);

	// TODO display errors
}

function setFailure(number) {
	// number indicates the component that failed

	// set components before to success
	for (let i = 0; i < number; i++) {
		progressElements[i].classList.remove('bg-danger');
		progressElements[i].classList.add('bg-success');
	}

	// set components after to failure
	for (let i = number; i < progressElements.length; i++) {
		progressElements[i].classList.remove('bg-success');
		progressElements[i].classList.add('bg-danger');
	}
}

function displayObjectDiagrams(response) {
	removeChildren(objectDiagrams);

	if (!response.objectDiagrams) {
		return;
	}

	for (let objectDiagram of response.objectDiagrams) {
		const name = objectDiagram.name;
		const id = 'od-' + name.replace(/\W/g, '-');

		addTab(objectDiagramTab, objectDiagramTabContent, id, name, renderObjectDiagram(objectDiagram));
	}

	// show the first object diagram
	// TODO remember the last active tab (name)
	objectDiagramTab.firstChild.firstChild.classList.add('active');
	objectDiagramTab.firstChild.firstChild.setAttribute('aria-selected', 'true');
	objectDiagramTabContent.firstChild.classList.add('show', 'active');
}

function renderObjectDiagram(objectDiagram) {
	const name = objectDiagram.name;
	const content = objectDiagram.content;

	if (name.endsWith('.png')) {
		const image = document.createElement('img');
		image.src = 'data:image/png;base64,' + content;
		image.alt = name;
		return image;
	} else if (name.endsWith('.svg')) {
		const div = document.createElement('div');
		div.innerHTML = content;
		return div;
	} else if (name.endsWith('.yaml') || name.endsWith('.txt')) {
		const pre = document.createElement('pre');
		pre.innerText = content;
		return pre;
	} else if (name.endsWith('.html')) {
		const iframe = document.createElement('iframe');
		iframe.width = '100%';
		iframe.height = '500px';
		iframe.src = 'data:text/html,<strong>Your browser cannot display this mockup!</strong>';
		iframe.srcdoc = content;
		return iframe;
	}
	throw 'unknown object diagram type ' + name;
}

// --------------- Examples ---------------

function loadExamples() {
	for (let i = 0; i < examples.length; i += 2) {
		const groupName = examples[i];
		const groupItems = examples[i + 1];

		const optgroup = document.createElement('optgroup');
		optgroup.label = (i / 2 + 1) + '. ' + groupName;

		for (let j = 0; j < groupItems.length; j++) {
			const groupItem = groupItems[j];
			const option = document.createElement('option');

			option.value = groupName.toLowerCase() + '/' + groupItem.replace(' ', '');
			option.label = option.innerText = (i / 2 + 1) + '.' + (j + 1) + '. ' + groupItem;

			optgroup.appendChild(option);
		}

		exampleSelect.appendChild(optgroup);
	}
}

function loadStoredExample() {
	selectedExample = localStorage.getItem(persistenceKeys.selectedExample) || '';
	exampleSelect.value = selectedExample;
	displayExample(selectedExample);
}

function selectExample(value) {
	selectedExample = value;
	trySetStorage(persistenceKeys.selectedExample, value);
	displayExample(value);
}

function displayExample(value) {
	exampleWarning.hidden = !value;

	if (!value) {
		const storedScenarioText = localStorage.getItem(persistenceKeys.storedScenario) || defaults.scenarioText;
		scenarioInputCodeMirror.setValue(storedScenarioText);
		submit();
		return;
	}

	const url = 'examples/' + value + '.md';
	const request = new XMLHttpRequest();

	scenarioInputCodeMirror.setValue('// loading...');

	request.addEventListener('load', function() {
		if (this.status === 200) {
			const text = this.responseText;
			scenarioInputCodeMirror.setValue(text);

			// auto run code gen
			submit();
		} else {
			scenarioInputCodeMirror.setValue('// failed to load ' + url + ': ' + this.status);
		}
	});
	request.open('GET', url, true);
	request.send();
}

// --------------- Download Zip ---------------

function downloadProjectZip() {
	saveConfig();

	const body = JSON.stringify({
		privacy: getPrivacy(),
		packageName: packageNameField.value || defaults.packageName,
		scenarioFileName: scenarioFileNameField.value || defaults.scenarioFileName,
		projectName: projectNameField.value || defaults.projectName,
		projectVersion: projectVersionField.value || defaults.projectVersion,
		scenarioText: scenarioInputCodeMirror.getValue(),
	});
	const request = new XMLHttpRequest();

	request.open('POST', apiUrl + '/projectzip', true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.responseType = 'blob';
	request.addEventListener('load', function() {
		if (request.status === 200) {
			const blob = request.response;
			const link = document.createElement('a');

			link.href = window.URL.createObjectURL(blob);
			link.download = 'project.zip';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	});
	request.send(body);
}

// --------------- Helpers ---------------

function api(method, url, body, handler) {
	const requestBody = JSON.stringify(body);
	const request = new XMLHttpRequest();

	request.overrideMimeType('application/json');
	request.addEventListener('load', function() {
		handler(JSON.parse(this.responseText));
	});
	request.open('POST', url, true);
	request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	request.send(requestBody);
}

function removeChildren(element) {
	while (element.firstChild) {
		element.firstChild.remove();
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
