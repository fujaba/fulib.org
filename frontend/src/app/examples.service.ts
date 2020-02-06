import {Injectable} from '@angular/core';

import {HttpClient} from '@angular/common/http'

import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';

import ExampleCategory from "./model/example-category";
import Example from "./model/example";

@Injectable({
  providedIn: 'root'
})
export class ExamplesService {
  private url = 'http://localhost:4567/examples';

  private readonly categories: ExampleCategory[] = [
    {
      name: 'Definitions', examples: [
        {name: 'Basics'},
        {name: 'Simple Definitions'},
        {name: 'Complex Definitions'},
        {name: 'Associations'},
        {name: 'Special Associations'},
      ]
    },
    {
      name: 'Testing', examples: [
        {name: 'Expectations'},
        {name: 'Relational Operators'},
        {name: 'Object Diagrams'},
      ]
    },
    {
      name: 'Transformation', examples: [
        {name: 'Lists'},
        {name: 'Modifying Data'},
        {name: 'Conditionals'},
        {name: 'Loops'},
      ]
    },
    {
      name: 'Methods', examples: [
        {name: 'Calling Methods'},
        {name: 'Passing Arguments'},
        {name: 'Piecewise Definition'},
      ]
    },
    {
      name: 'Prototyping', examples: [
        {name: 'Data Model'},
        {name: 'Web Gui'},
        {name: 'Prototype'},
      ]
    },
  ];

  constructor(
    private http: HttpClient,
  ) {
    for (let category of this.categories) {
      for (let example of category.examples) {
        example.category = category;
      }
    }
  }

  getCategories(): ExampleCategory[] {
    return this.categories;
  }

  getScenario(example: Example): Observable<string> {
    if (example.scenario) {
      return of(example.scenario);
    }
    const url = `${this.url}/${example.category.name.toLowerCase()}/${example.name.replace(' ', '')}.md`;
    return this.http.get(url, { responseType: 'text'}).pipe(tap(text => example.scenario = text));
  }
}
