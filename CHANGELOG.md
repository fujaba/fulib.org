# fulib.org v0.1.0

+ Initial release.

# fulib.org v0.2.0

+ Added support for HTML object diagrams / mockups from FulibScenarios v0.5.0. #18
* Object diagrams are now sorted by order of occurrence in the scenario text. #17
* Fixed static files missing from artifact.

# fulib.org v0.2.1

* Exceptions are now properly logged.

# fulib.org v0.2.2

* Fixed incorrect static files location.

# fulib.org v0.3.0

### Frontend

+ Added the `Download Gradle Project` button. #19
+ Added Web App and FulibScenarios version info and GitHub links. #20
* Object Diagrams are now shown as tabs instead of a long list. #23
* The selected example is now persisted across sessions. #24

### Backend

+ Added the `/projectzip` API route. #19
* Updated to FulibScenarios v0.5.0.

# fulib.org v0.3.1

* Downloaded projects now use FulibScenarios v0.5.0.

# fulib.org v0.3.2

* Downloaded projects now use the maven local repository.

# fulib.org v0.3.3

* Downloaded projects now use FulibMockups v0.1.0.
* Downloaded projects now use FulibGradle v0.1.1.
* Downloaded projects now use Gradle v5.5.1.

# fulib.org v0.4.0

+ The Java Code now also shows model methods. #26
+ Added support for the `.txt` diagram format.
* Updated to FulibScenarios v0.6.0.
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
* Updated to FulibScenarios v0.7.0.
* Fixed small UI on mobile. #31

# fulib.org v0.7.0

+ Added analytic request logging. #37
* Updated to FulibScenarios v0.8.0.

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

* Updated to FulibScenarios v0.9.1.
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

# fulib.org v1.1.0

## New Features

+ Added a toggle to the Compile and Run button that does it automatically when the scenario changes. #65
+ When visiting a new version of fulib.org, the changelog since the last visited version is shown. #66
+ Examples can now be linked by adding a query parameter like `?example=Basics` to the URL. #68
+ Added documentation links at the end of examples. #69

## Tool Updates 

* Updated to FulibTools v1.1.0.
* Updated to FulibScenarios v1.1.0.

## Improvements

* Major improvements to style and dark mode.
* Cleaned up the backend code.
* Rewrote the frontend with Angular. #63
* Overhauled the page footer. #64

# fulib.org v1.2.0

## New Features

+ Added Assignments and related functionality:
  + Assignment creation form #48 #55 #62 #71 #72 #74 #78
  + Assignment viewer #49 #61
  + List of solutions for an assignment #50 #52 #57 #73
  + Solution viewer #53 #54 #56 #58 #77
  + List of created assignments #75
  + List of own solutions #76
  + Courses #70

## Tool Updates

+ Added a dependency on FulibTables v1.3.0.
* Updated to FulibScenarios v1.2.0.
* Updated to FulibGradle v0.3.0.
* Updated to Gradle v6.3.

# fulib.org v1.3.0

## Tool Updates

* Updated to FulibScenarios v1.3.0.
* Updated to FulibGradle v0.4.0.
* Downloaded Gradle Projects now use JUnit v4.13.

# fulib.org v1.2.1

## New Features

+ Added a checkbox to toggle whether the changelog should open automatically when a new update was released.

## Improvements

* Improved the way version numbers are displayed in the changelog sidebar.
* The changelog no longer shows future versions.

# fulib.org v1.3.1

## General

* Merged changes from v1.2.1 into the v1.3 branch.

## New Features

+ Downloaded Gradle projects can now include a decorator class whose name is configurable.
