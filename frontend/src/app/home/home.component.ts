import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  features = [
    {
      icon: 'file-earmark-richtext',
      title: 'Scenarios',
      description: 'A textual example description and programming language based on Markdown and regular English.',
      link: '/editor',
    },
    {
      icon: 'book',
      title: 'Docs',
      description: 'Clearly structured and easy-to-understand documentation for all fulib tools and libraries.',
      link: '/docs',
    },
    {
      icon: 'folder2-open',
      title: 'Projects',
      description: 'A Web IDE for Java and fulibScenarios with terminal and collaborative editing support.',
      link: '/projects',
    },
    {
      icon: 'list-task',
      title: 'Assignments',
      description: 'Student assignment and submission system with GitHub Classroom integration and assisted and intelligent grading.',
      link: '/assignments',
    },
  ];

  constructor() {
  }

  ngOnInit(): void {
  }

}
