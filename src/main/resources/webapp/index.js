// =============== Constants ===============

const apiUrl = '';

const examples = [
	'Definitions', [
		'Simple Definitions',
		'Complex Definitions',
	],
	'Testing', [
		'Expectations',
		'Relational Operators',
		'Diagrams',
	],
	'Methods', [
		'Calling',
		'Passing Arguments',
	],
];

const exampleSelect = document.getElementById('exampleSelect');

const scenarioInput = document.getElementById('scenarioInput');
const scenarioInputCodeMirror = CodeMirror.fromTextArea(scenarioInput, {
	mode: 'markdown',
	lineNumbers: true,
	lineWrapping: true,
	styleActiveLine: true,
	extraKeys: {
		'Ctrl-Enter': submit,
		'Cmd-Enter': submit,
	},
});

const javaTestOutput = document.getElementById('javaTestOutput');
const javaTestOutputCodeMirror = CodeMirror.fromTextArea(javaTestOutput, {
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
const classDiagram = document.getElementById('classDiagram');

// =============== Variables ===============

let selectedExample = '';

// =============== Initialization ===============

init();

function init() {
	for (let i = 0; i < examples.length; i += 2) {
		const groupName = examples[i];
		const groupItems = examples[i + 1];

		const optgroup = document.createElement('optgroup');
		optgroup.label = groupName;

		for (let groupItem of groupItems) {
			const option = document.createElement('option');

			option.value = groupName.toLowerCase() + '/' + groupItem.replace(' ', '');
			option.label = groupItem;
			option.innerText = groupItem;

			optgroup.appendChild(option);
		}

		exampleSelect.appendChild(optgroup);
	}

	selectExample('');
}

// =============== Functions ===============

// --------------- Event Handlers ---------------

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

function displayObjectDiagram(objectDiagram) {
	const name = objectDiagram.name;
	const content = objectDiagram.content;

	objectDiagrams.appendChild(document.createElement('hr'));

	const headline = document.createElement('h4');
	headline.innerText = name;
	objectDiagrams.appendChild(headline);

	if (name.endsWith('.png')) {
		const image = document.createElement('img');
		image.src = 'data:image/png;base64,' + content;
		image.alt = name;
		objectDiagrams.appendChild(image);
	} else if (name.endsWith('.svg')) {
		const div = document.createElement('div');
		div.innerHTML = content;
		objectDiagrams.appendChild(div);
	} else if (name.endsWith('.yaml')) {
		const pre = document.createElement('pre');
		pre.innerText = content;
		objectDiagrams.appendChild(pre);
	}
}

function displayObjectDiagrams(response) {
	removeChildren(objectDiagrams);

	if (!response.objectDiagrams) {
		return;
	}

	for (let objectDiagram of response.objectDiagrams) {
		displayObjectDiagram(objectDiagram);
	}
}

function handleResponse(response) {
	console.log(response.output);
	console.log('exit code: ' + response.exitCode);

	let javaCode = '';
	if (response.exitCode !== 0) {
		javaCode += response.output.split('\n').map(function(line) {
			return '// ' + line;
		}).join('\n') + '\n';
		setFailure(response.exitCode & 3);
	} else {
		setFailure(progressElements.length);
	}

	if (response.testMethods) {
		for (testMethod of response.testMethods) {
			javaCode += '// ' + testMethod.name + '\n';
			javaCode += testMethod.body;
		}
	}
	javaTestOutputCodeMirror.setValue(javaCode);

	removeChildren(classDiagram);
	classDiagram.innerHTML = response.classDiagram;

	displayObjectDiagrams(response);

	// TODO display errors
}

function submit() {
	const text = scenarioInputCodeMirror.getValue();

	if (!selectedExample) {
		localStorage.setItem('fulibScenario', text);
	}

	removeChildren(objectDiagrams);
	removeChildren(classDiagram);

	javaTestOutputCodeMirror.setValue('// loading...');
	objectDiagrams.innerText = 'loading...';
	classDiagram.innerText = 'loading...';

	const requestBody = {
		scenarioText: text,
	};

	api('POST', apiUrl + '/runcodegen', requestBody, handleResponse);
}

function selectExample(value) {
	selectedExample = value;

	if (!value) {
		const oldValue = localStorage.getItem('fulibScenario');

		if (oldValue) {
			scenarioInputCodeMirror.setValue(oldValue);
			submit();
		} else {
			scenarioInputCodeMirror.setValue(''
				+ '// start typing your scenario or select an example using the dropdown above.\n\n'
				+ '# Scenario My First. \n\n'
				+ 'There is a Car with name Herbie. \n');
		}
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
