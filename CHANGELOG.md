# fulib.org v0.1.0

+ Initial release.

# fulib.org v0.2.0

+ Added support for HTML object diagrams / mockups from fulibScenarios v0.5.0. #18
* Object diagrams are now sorted by order of occurrence in the scenario text. #17
* Fixed static files missing from artifact.

# fulib.org v0.2.1

* Exceptions are now properly logged.

# fulib.org v0.2.2

* Fixed incorrect static files location.

# fulib.org v0.3.0

### Frontend

+ Added the `Download Gradle Project` button. #19
+ Added Web App and fulibScenarios version info and GitHub links. #20
* Object Diagrams are now shown as tabs instead of a long list. #23
* The selected example is now persisted across sessions. #24

### Backend

+ Added the `/projectzip` API route. #19
* Updated to fulibScenarios v0.5.0.

# fulib.org v0.3.1

* Downloaded projects now use fulibScenarios v0.5.0.

# fulib.org v0.3.2

* Downloaded projects now use the maven local repository.

# fulib.org v0.3.3

* Downloaded projects now use fulibMockups v0.1.0.
* Downloaded projects now use fulibGradle v0.1.1.
* Downloaded projects now use Gradle v5.5.1.

# fulib.org v0.4.0

+ The Java Code now also shows model methods. #26
+ Added support for the `.txt` diagram format.
* Updated to fulibScenarios v0.6.0.
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
* Updated to fulibScenarios v0.7.0.
* Fixed small UI on mobile. #31

# fulib.org v0.7.0

+ Added analytic request logging. #37
* Updated to fulibScenarios v0.8.0.

# fulib.org v0.7.1

* Improved the page layout.

# fulib.org v0.8.0

+ Added Go To Line to the editor. #40
+ Added Search and Replace to the editor. #39
+ Added the `Transformations` example category and three examples.
* Improved the page layout.
* Updated fulibScenarios to v0.8.1 and fulibMockups to v0.2.0.
* Updated CodeMirror to v5.48.4.

# fulib.org v0.8.1

* Updated fulibScenarios to v0.8.2.
* Replaced version placeholders.
* Fixed `undefined` class diagram and replaced it with an info text.
* The selected example is now included in the request.

# fulib.org v0.9.0

### Scenarios

* Updated to fulibScenarios v0.9.1.
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

+ Added examples for GUI prototyping using fulibMockups.
* Updated to fulibScenarios v1.0.0.

# fulib.org v1.1.0

## New Features

+ Added a toggle to the Compile and Run button that does it automatically when the scenario changes. #65
+ When visiting a new version of fulib.org, the changelog since the last visited version is shown. #66
+ Examples can now be linked by adding a query parameter like `?example=Basics` to the URL. #68
+ Added documentation links at the end of examples. #69

## Tool Updates 

* Updated to fulibTools v1.1.0.
* Updated to fulibScenarios v1.1.0.

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

+ Added a dependency on fulibTables v1.3.0.
* Updated to fulibScenarios v1.2.0.
* Updated to fulibGradle v0.3.0.
* Updated to Gradle v6.3.

# fulib.org v1.3.0

## Tool Updates

* Updated to fulibScenarios v1.3.0.
* Updated to fulibGradle v0.4.0.
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

# fulib.org v1.4.0

## General

+ Added fulibYaml to GitHub links and What's New.
* Updated to fulibScenarios v1.4.0.
* Updated to Angular 9.
* Updated to Gradle v6.5.1.
* Cleaned up the backend code.
* Cleaned up the frontend code and improved performance.

## QoL and Usability Improvements

* General
  * Cleaned up the GitHub menu in the footer.
  * The warning text when an example is selected is now hidden behind the tooltip of an icon.
  * Improved the tooltip of the `Compile and Run` button.
  * Added tooltips to collapse/expand buttons.
  
* Assignment Creation
  * Tasks in the assignment creation form can now be restored after deletion.
  * Added tooltips to the buttons in the assignment creation form.
  * Added tooltips to the buttons in the course creation form.
  * Outputs in the task lists during assignment creation are now shown below the verification editor.
  * Import buttons are now disabled and have a tooltip if no file is selected.
  
* Viewing Solutions
  * Replaced the `Edit` button in the My Solutions list with a separate item for the current draft. #82
  * Changed the button label for submitting comments to `Submit`.
  * Added the Ctrl-Enter shortcut for the comment submit button.
  * Outputs in the task list of solutions are now shown in a collapsible editor.

* Grading Solutions
  * Changed the button label for search help to `?` and added a tooltip.

## Bugfixes

* Fixed a timezone problem with deadlines in the assignment creation form. #83
* Fixed 404 pages changing the tab title until the page is reloaded.

# fulib.org v1.4.1

## General

* Updated to fulib v1.2.1.
* Updated to fulibTools v1.2.1.
* Updated to fulibScenarios v1.4.1.

## Bugfixes

* Form fields in the Project Configuration window are now properly validated. #47 #87

# fulib.org v1.4.2

## General

* Updated to fulib v1.2.3.
* Updated to fulibTools v1.2.1.
* Updated to fulibScenarios v1.4.2.

## Improvements

* What's New now arranges repos as tabs. #88 #91
* Improved the accessibility for some links in the footer. #89
* Made the "Show Output" and "Grade" links in task lists actual buttons. #89
* The query parameter `atok` can now be used to set the assignment token when viewing all solutions. #92
* The query parameters `atok` and `stok` can be now be used to set the assignment or solution token when viewing a solution. #92
* Downloaded `build.gradle` files no longer dictate Java version compatibility. #94

# fulib.org v1.5.0

## General

* Updated to fulib v1.3.0.
* Updated to fulibTools v1.3.0.
* Updated to fulibScenarios v1.5.1.
* Updated to fulibYaml v1.4.0.
* Updated to fulibTables v1.4.0.

## New Features

+ Scenario editors now display errors, warnings and notes. #7 #86
+ Replaced the old dark mode switch with a new control that allows switching between light, automatic and dark mode. #95
  > Automatic mode changes the theme automatically depending on user agent/OS preference.
+ Added lexical syntax highlighting for scenario editors. #97 #98
+ Added the About page for viewing third-party licenses under Legal in the navigation bar. #102
+ Added support for task lists when rendering Markdown. #106
+ Added an example for Placeholders. #107
+ Added a link for Getting Started under Help in the navigation bar. #108
+ Added a Close button to the Feedback modal. #108

## Improvements

* Modals now have proper URLs. #96
  > This improves their compatibility with many browser features, including reload, back/forward, history, bookmarks, and sharing.
* Changed the footer into a navigation bar at the top. #100
* Downloaded Gradle projects now use `testImplementation` instead of `testCompile`. #103 #105
* Downloaded Gradle projects now declare a test dependency on `slf4j-nop`. #103 #105
* Downloaded Gradle projects no longer use the snapshots repository. #105
* Restructured the navigation bar. #108

## Removals

- Removed the contact email from the Feedback modal. #108

# fulib.org v1.6.0

## General

* Updated to fulib v1.4.1.
* Updated to fulibTools v1.4.0.
* Updated to fulibScenarios v1.6.1.

## New Features

+ Added a user account system which can be accessed via the user icon in the navigation bar. #60 #84
  + Registered users can access their assignments, solutions and courses from any device.
  + Name and Email fields in assignments and solutions are automatically filled from the account.
  > Creating an assignment as a guest/without being logged in currently displays a warning, but may be disabled in the future. In addition, assignments created by registered users display a verification badge.
+ Added "My Courses" to the Assignments menu. #84
  > This feature can only be used by registered users.
+ Comments can now be deleted. #59 #84
  > This is only possible if the comment was posted as a registered user. The same user needs to be logged in to delete the comment.
+ Panels in the main editor can now be rearranged and hidden. #109 #112
+ Added the Markdown panel to the main editor. #110 #112
+ Added the Output panel to the main editor. #111 #112
+ The output panel now detects exceptions and displays a link for reporting them. #114
+ Diagrams and files generated as part of scenario compilation are now available as URLs for up to an hour. #115
+ All API endpoints are now also available with an `/api` path prefix. #117
+ Added the `GET /api/versions` endpoint for retrieving the versions of different fulib components. #119

## Improvements

* Moved the "Edit Privacy Preferences" menu item to the user menu. #84
* Moved the theme switch to the user menu. #84
* Blockquotes, fenced code blocks and tables are now properly rendered and styled in Markdown views. #113
* The View button in the solutions table now correctly links to the solution again. #118
* Example scenarios now use blockquote comments. #121

# fulib.org v1.6.1

## General

* Updated to fulibScenarios v1.6.2. #124
* Updated to fulibTools v1.4.1. #124

## New Features

+ Added the View menu for showing and hiding editor panels and removed the bottom bar. #123
+ Added the Reset Editor Layout button in the View menu. #123

## Improvements

* Expanded the Placeholders example with inheritance and more objects. #124

## Bugfixes

* Class and object diagrams can now be scrolled if they are too large for the panel. #122

# fulib.org v1.7.0

## General

* Updated to fulib v1.5.1. #142
* Updated to fulibTools v1.5.1. #142
* Updated to fulibYaml v1.5.0. #142
* Updated to fulibScenarios v1.7.0. #142
* Updated to fulibMockups v0.4.0. #127 #142
* Updated to fulibGradle v0.5.0. #127
* Updated to Gradle v6.8.2. #142
* Updated to Angular 11. #131
* Updated various frontend dependencies. #131 #143
* Updated to Keycloak 12 and switched to the new auth service. #141

## New Features

+ Scenarios are now compiled with fulibMockups on the classpath. #127
+ Added an example for the new fulibMockups UIs. #127
+ Clicking class and object diagrams now opens them in a model. #130

## Improvements

* Modals are now animated. #67 #131
* Increased the size of class and object diagrams. #130
* Removed `jcenter` repository from generated `build.gradle` files. #142

## Bugfixes

* The selected example is no longed saved in local storage. #126

## Removals

- Removed the old fulibMockups examples. #127
