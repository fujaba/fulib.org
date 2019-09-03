# Unidirectional Associations

There is a University Uni Kassel.
There is a Person with name Peter.
There are Persons with name Alice and Bob.

// A unidirectional to-one association is declared like a regular attribute.
Uni Kassel has president Peter.

// You can create to-many associations by listing multiple values, separated by ',' or 'and'.
The Uni Kassel has employees Alice and Bob.

# Bidirectional Associations

There is a University Uni Kassel.
There are Students with name Alice, Bob, Charlie, Dude.

// A bidirectional association requires you to specify the name of the reverse role.
// You can do that by adding 'and is <name> of'.
Uni Kassel has students and is uni of Alice, Bob, Charlie, Dude.

// The above sentence can be written in reverse like so:
Alice has uni and is one of the students of the Uni Kassel.

// Note that "one of" indicates that the reverse association is to-many.
