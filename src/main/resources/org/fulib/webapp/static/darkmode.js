// =============== Initialization ===============

loadTheme();

// =============== Methods ===============

// adapted from https://github.com/coliff/dark-mode-switch

function loadTheme() {
	const darkThemeSelected = localStorage.getItem('darkSwitch') === 'dark';
	darkSwitch.checked = darkThemeSelected;
	displayDarkMode(darkThemeSelected);
}

function updateTheme() {
	displayDarkMode(darkSwitch.checked);

	// save
	if (darkSwitch.checked) {
		trySetStorage('darkSwitch', 'dark');
	} else {
		localStorage.removeItem('darkSwitch');
	}
}

function displayDarkMode(enabled) {
	let editorTheme;
	if (enabled) {
		document.body.setAttribute('data-theme', 'dark');
		editorTheme = 'darcula';
	} else {
		document.body.removeAttribute('data-theme');
		editorTheme = 'idea';
	}

	scenarioInputCodeMirror.setOption('theme', editorTheme);
	javaTestOutputCodeMirror.setOption('theme', editorTheme);
}
