# fulib.org v0.1.0

+ Initial release.

# fulib.org v0.2.0

+ Added support for HTML object diagrams / mockups from Fulib Scenarios v0.5.0. #18
* Object diagrams are now sorted by order of occurrence in the scenario text. #17
* Fixed static files missing from artifact.

# fulib.org v0.2.1

* Exceptions are now properly logged.

# fulib.org v0.2.1

* Fixed incorrect static files location.

# fulib.org v0.3.0

### Frontend

+ Added the `Download Gradle Project` button. #19
+ Added Web App and Fulib Scenarios version info and GitHub links. #20
* Object Diagrams are now shown as tabs instead of a long list. #23
* The selected example is now persisted across sessions. #24

### Backend

+ Added the `/projectzip` API route. #19
* Updated to Fulib Scenarios v0.5.0.

# fulib.org v0.3.1

* Downloaded projects now use Fulib Scenarios v0.5.0.

# fulib.org v0.3.2

* Downloaded projects now use the maven local repository.

# fulib.org v0.3.3

* Downloaded projects now use Fulib Mockups v0.1.0.
* Downloaded projects now use Fulib Gradle v0.1.1.
* Downloaded projects now use Gradle v5.5.1.

# fulib.org v0.4.0

+ The Java Code now also shows model methods. #26
+ Added support for the `.txt` diagram format.
* Updated to Fulib Scenarios v0.6.0.
* Internal stack trace lines in console output are now folded.

# fulib.org v0.5.0

+ Added a warning banner if JavaScript is disabled. #27
+ Added a privacy preferences popup. #28
+ Added a leave feedback popup. #29

# fulib.org v0.6.0

+ Added the `Basics` example scenario. #36
+ Added the `Associations` and `Special Associations` example scenarios. #35
* Example scenarios in the dropdown are now numbered. #34
* Updated all existing example scenarios. #33
* Updated to Fulib Scenarios v0.7.0.
* Fixed small UI on mobile. #31

# fulib.org v0.7.0

+ Added analytic request logging. #37
* Updated to Fulib Scenarios v0.8.0.

# fulib.org v0.7.1

* Improved the page layout.

# fulib.org v0.8.0

+ Added Go To Line to the editor. #40
+ Added Search and Replace to the editor. #39
+ Added the `Transformations` example category and three examples.
* Improved the page layout.
* Updated FulibScenarios to v0.8.1 and FulibMockups to v0.2.0.
* Updated CodeMirror to v5.48.4.

# fulib.org v0.8.1

* Updated FulibScenarios to v0.8.2.
* Replaced version placeholders.
* Fixed `undefined` class diagram and replaced it with an info text.
* The selected example is now included in the request.

# fulib.org v0.9.0

### Scenarios

* Updated to Fulib Scenarios v0.9.1.
+ Added new examples for numeric Add and Remove, List Operations, .txt and .tables.html Object Diagrams, 'the answer', and piecewise method definitions. #45
* Swapped the Transformation and Methods example chapters.
* Improved existing examples. #38

### Interface

+ Added a Project Configuration dialog with settings for project name, package name, version, and scenario file name. #43
+ Added a warning label that changes to examples will not be saved.
+ Added a Dark Mode. #44
* The default editor theme in light mode is now `idea`.
* The default editor theme in dark mode is now `darcula`.
* Improved the way multiple methods are shown in the Java code view.
* Stack Trace Lines from the configured package are no longer filtered from the output.

### Download as Gradle Project

* Downloaded Gradle Projects now generate Class Diagram SVGs by default.
* Downloaded Gradle Projects now use Gradle v5.6.2.
* Downloaded Gradle Projects now includes a default .gitignore file.

# fulib.org v1.0.0

+ Added examples for GUI prototyping using FulibMockups.
* Updated to FulibScenarios v1.0.0.
