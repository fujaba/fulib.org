# Calling Methods

// You can call methods using the 'call' keyword.
We call make-company.

// From here, we no longer describe the test method, but the make-company method.
// To specify this, we use sentences with the subject "make-company".
// 'Creates' provides an alternative to 'there' that allows defining a subject.
Make-company creates a Company with name Foosoft and with revenue 0.
Make-company creates Employees with name John, Jack, Jill, and Jenna.

// You can still use 'has' inside method bodies.
Foosoft has employees John, Jack, Jill and Jenna.

// Return an object from a method using the 'answers' keyword.
Make-company answers with Foosoft.

// Now we are back in the scope of the test method.
// The result of the call is now available as a variable.
We expect that Foosoft has name "Foosoft".

// You can also call a method on an object.
We call generateRevenue on Foosoft.
GenerateRevenue writes 9000 into revenue of Foosoft.

// If you use a sentence that does not match the subject of the call, you will end up back in the test method scope.
We expect that Foosoft has revenue 9000.
