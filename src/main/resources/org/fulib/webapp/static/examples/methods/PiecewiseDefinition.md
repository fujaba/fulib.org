# Piecewise Definition of Methods

// Every time you call a method and do things within it, you define part of that method.
// In the end, all parts will end up in the method body the order in which you wrote them.

We call min with x 1 and with y 2.

// Here we define the first part: the if statement and its body
As x is less than y, min answers with x.

We expect that the answer is 1.

// Now we call the method again...
We call min with x 10 and with y 3.

// ... providing the second part of the body, the return statement. 
min answers with y.

We expect that the answer is 3.
