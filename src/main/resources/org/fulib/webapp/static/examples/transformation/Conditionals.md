# Conditionals

// When you want to perform an action only if a certain condition is met,
// you can use conditional sentences.
// They use the keyword 'as', followed by a conditional expression.
// See "Testing / Relational Operators" for examples of them.
// Conditional sentences are translated to if statements in Java.

As 10 is less than 20, we write 10 into min.

// You can have multiple statements in the resulting if body by separating sentences with ',' or 'and'.

As 2 is not 3, we write 1 into x, we write 2 into y, and we write 3 into sum.

// It is not possible to create an 'else' branch in the scenario language.
// You can emulate it by inverting the condition.

As 2 is 3, we expect that 4 is 6.

// Here is a way to define the "min" method using conditional sentences:

We call min with x 10 and with y 3.
As y is less than x, min answers with y.
We expect that the answer is 3.

We call min with x 4 and with y 7.
min answers with x.

We call min with x 8 and with y 2.
We expect that the answer is 2.
