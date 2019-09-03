# Modifying Data

There is a Student with name Carli and with 10 credits.

// When you want to change an existing data model,
// use write sentences as shown below.
We write 20 into credits of Carli.

// You can also write into a variable directly.
// It is declared the first time it is written to.
We write 30 into credits.

// Now you can copy the value back into the attribute.
We write credits into credits of Carli.

// The other direction also works.
We write credits of Carli into credits.

// You can also write multiple values into one variable...
We write 1,2,3 into numbers.

// ... or into multiple variables.
We write 1,2,3 into x,y,z.

# Adding and Removing

## with Lists

We write 1,2,3 into list.

// You can add elements to a list using the 'add' keyword.
We add 4,5,6 to list.

// To remove elements from a list, use the 'remove' keyword.
We remove 1,3,5 from list.

## with Attributes and Associations

There are Students with name Alice, Bob and Charlie.
Alice has grades 1,2,3 and Bob has grades 2,1,2.
Alice has friends and is one of the friends of Bob and Charlie.

// The 'add' and 'remove' keywords also work with attributes...
We add 2 to grades of Alice.
We add 3,2 to grades of Bob.

// ... and associations.
We add Charlie to friends of Bob.
We remove Bob and Charlie from friends of Alice.
