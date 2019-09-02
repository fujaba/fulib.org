# Special Associations

There are Students with name Alice, Bob, Charlie, Dude.

// Associations can also target the original class.
Alice has right-neighbor and is left-neighbor of Bob.

// You can also create an association whose reverse is itself:
Charlie has best-friend and is best-friend of Dude.

// This also works with to-many associations.
Bob has friends and is one of the friends of Alice and Charlie.

// some times you need so-called self associations: 
Dude has partners Charlie and Dude. 

# Invalid Associations

There are Persons with name Alice, Bob, Charlie, Dude.

// Make sure that when creating associations that are their own reverse,
// you write either "one of" followed by many items,
// or no "one of" and one item.
// E.g., the following are invalid:

// Alice has associate and is one of the associate of Bob. // "one of" but one item
// Charlie has enemies and is enemies of Alice and Dude.   // no "one of" but many items

// Intuitively, you can see that the sentences are grammatically weird,
// because of the mixed singular and plural forms.
// We can change the first "associate" to plural and add another example item.

Alice has associates and is associate of Bob and Charlie.

// The second sentence can be fixed by changing the second "enemies" to singular.

Charlie has enemies and is enemy of Alice and Dude.

// The sentences now make sense again and can be compiled.
// Note that the association is no longer it's own reverse.
