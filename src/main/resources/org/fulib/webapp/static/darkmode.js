// =============== Initialization ===============

loadTheme();

// =============== Methods ===============

// adapted from https://github.com/coliff/dark-mode-switch

function loadTheme() {
	const dataTheme = localStorage.getItem('theme');
	const darkThemeSelected = dataTheme ? dataTheme === 'dark' : window.matchMedia(
		'(prefers-color-scheme: dark)').matches;
	darkSwitch.checked = darkThemeSelected;
	displayDarkMode(darkThemeSelected);
}

function updateTheme() {
	displayDarkMode(darkSwitch.checked);

	// save
	if (darkSwitch.checked) {
		trySetStorage('theme', 'dark');
	} else {
		trySetStorage('theme', 'light');
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
