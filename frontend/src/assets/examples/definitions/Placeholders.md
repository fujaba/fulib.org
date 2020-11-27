# Placeholders

> In some situations, you may want to define your class model without coming up with concrete objects.
> This is where Placeholders become useful.

## Inheritance

> Using 'Every', you can specify that one class inherits from another:

Every student is a person.

## 'Every' and Types

> 'Every' is also useful for defining attributes and associations.
> In the examples below, "Every X" acts as a placeholder for a concrete object.
> Meanwhile, "a Y of type Z" is a placeholder for a concrete attribute value.

Every person has a name of type string.
Every person has an age of type int.
Every student has a motivation of type double.

Every university has students and is uni of many Students.
Every student has uni and is one of the students of a University.

## Concrete Objects as Subjects

> The placeholders can be combined with concrete objects.
> Let's define some first using familiar syntax.
> Note that these sentences are the only ones in this example
> that actually generate code in the test method.
> All others merely affect the class model.

There is the person Alice.
There are the students Bob and Charlie.
There is the university StudyRight.

> The next sentences define the same attributes and associations as above,
> but their subject is a concrete object.

Alice has a name of type string.
Alice has an age of type int.
Bob has a motivation of type double.

StudyRight has students and is uni of many students.
Bob has uni and is one of the students of a university.

## Examples with 'like'

> You can optionally supply examples with 'like'.
> Again we define the same attributes and associations.

Every person like Alice has a name of type string.
Every person like Alice has an age of type int.
Every student like Bob has a motivation of type double.

StudyRight has students and is uni of many Students like Bob and Charlie.
Bob has uni and is one of the students of a University like StudyRight.

> For attributes, you can also keep the example and remove the type.

Every person has a name like "Alice".
Every person has an age like 20.
Every student has a motivation like 12.3.
