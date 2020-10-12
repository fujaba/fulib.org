# Placeholders

> In some situations, you may want to define your class model without coming up with concrete objects.
> This is where Placeholders become useful.

## 'Every' and Types

> In the examples below, "Every X" acts as a placeholder for a concrete object.
> Meanwhile, "a Y of type Z" is a placeholder for a concrete attribute value.

Every student has a name of type string.
Every student has an age of type int.
Every student has a motivation of type double.

Every university has students and is uni of many Students.
Every student has uni and is one of the students of a University.

## Concrete Objects as Subjects

> The placeholders can be combined with concrete objects.
> Let's define some first using familiar syntax.
> Note that these sentences are the only ones in this example
> that actually generate code in the test method.
> All others merely affect the class model.

There are the Students Alice and Bob.
There is the University StudyRight.

> The next sentences define the same attributes and associations as above,
> but their subject is a concrete object.

Alice has a name of type string.
Alice has an age of type int.
Alice has a motivation of type double.

StudyRight has students and is uni of many Students.
Alice has uni and is one of the students of a University.

## Examples with 'like'

> You can optionally supply examples with 'like'.
> Again we define the same attributes and associations.

Every student like Alice has a name of type string.
Every student like Alice has an age of type int.
Every student like Alice has a motivation of type double.

StudyRight has students and is uni of many Students like Alice and Bob.
Alice has uni and is one of the students of a University like StudyRight.

> For attributes, you can also keep the example and remove the type.

Every student has a name like "Alice".
Every student has an age like 20.
Every student has a motivation like 12.3.
