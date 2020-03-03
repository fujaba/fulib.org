# Lists

// Working with lists is very easy in the scenario language.
// Just write some items separated by commas:

We write 1,2,3 into numbers.

![numbers](numbers.txt)

// This also works with objects:

There are Students with name Alice, Bob, Charlie.
We write Alice, Bob, and Charlie into students.

// Note how we used 'and' before the last element (it can be used instead of a comma, or together with one).

![students](students.txt)

## Vectorized Access

// You can access attributes of all objects of a list at once:
We write name of students into name-list.

![name-list](name-list.txt)

## Ranges

// If you want to work with many numbers, ranges can simplify it a lot:
We write 1 to 10 into number-range.

![number-range](number-range.txt)

// They can be combined with regular lists, yielding a flat list:
We write 1 to 10, 20 to 40, and 60 to 100 into large-numbers.

## Filtering Lists

// You can extract all elements of a list which match a condition using filters (indicated by 'all ... which'):
We write all large-numbers which are greater than 50 into some-large-numbers.

## Expectations on Lists

// You can check if a list is empty:
We expect that numbers are not empty.
We expect that all numbers which are less than 0 are empty.

// Or if it contains an element:
We expect that some-large-numbers contain 65.
We expect that some-large-numbers do not contain 55.

# More Info

// Lists and ranges are described in detail in the Collections page of the documentation:
// https://fujaba.gitbook.io/fulib-scenarios/language/expressions/collections

// Vectorized Access in particular is explained in the page about Access:
// https://fujaba.gitbook.io/fulib-scenarios/language/expressions/access#vectorization
