# Unidirectional Associations

There is the University Uni Kassel.
There is a Person with name Peter.
There are Persons with name Alice and Bob.

> A unidirectional to-one association is declared like a regular attribute.

Uni Kassel has president Peter.

> You can create to-many associations by listing multiple values, separated by ',' or 'and'.

The Uni Kassel has employees Alice and Bob.

# Bidirectional Associations

There is the University Uni Kassel.
There are Students with name Alice, Bob, Charlie, Dude.

> A bidirectional association requires you to specify the name of the reverse role.
> You can do that by adding 'and is <name> of'.

Uni Kassel has students and is uni of Alice, Bob, Charlie, Dude.

> You can also define the association between Uni Kassel and Alice like this:

Alice has uni and is one of the students of the Uni Kassel.

> Note that "one of" indicates that the reverse association is to-many.

# Special Associations

There are Students with name Alice, Bob, Charlie, Dude.

> Associations can also target the original class.

Alice has right-neighbor and is left-neighbor of Bob.

> You can also create an association whose reverse is itself:

Charlie has best-friend and is best-friend of Dude.

> This also works with to-many associations.

Bob has friends and is one of the friends of Alice and Charlie.

# More Info

> You can learn more about associations in the documentation:
> https://fujaba.gitbook.io/fulib-scenarios/language/sentences/definition-sentences#associations
