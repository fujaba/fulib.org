# Basics

// These example scenarios will teach you the basics of the scenario language.
// It is best to view them in the order of items in the dropdown.
// You can modify the text at will to experiment.
// Make sure to click 'Compile and Run' when you are done to view the results.
// Changes to examples will be reset once you load a different example.

## Headers

// This example teaches you the basic syntax of scenario files.
// The first thing it needs is a header line, like '# Basics' at the top.
// This line becomes the name of the test method in the Java code.

// You can declare multiple header lines in one file (as shown at '# Comments' below).
// Each header lines starts one test method, or 'scenario'.
// Note that variables and entities from the previous scenario are no longer available after the header.

## Sections

// Lines starting with '##' become section headlines.
// In Java code, they are shown as comments.
// They do not reset variables and entities like scenario headers do.

# Comments

## Java Comments

// You may have noticed that most lines in this example start with '//'.
// Like in Java, this is used to indicate a comment.
// In particular, comments starting with '//' in the scenario file end up in the Java code verbatim as comments.

## Parenthesized Comments

// Another form of comment uses parentheses:

(This text will not end up in the Java code)

// Now that you know the syntactic details of the scenario language, you can proceed to the next example.
