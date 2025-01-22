import {Component} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
})
export class HomeComponent {
  features = [
    {
      icon: 'file-earmark-richtext',
      title: 'Scenarios',
      description: 'A textual example description and programming language based on Markdown and regular English.',
      link: '/scenarios',
    },
    {
      icon: 'diagram-3',
      title: 'Workflows',
      description: 'A web editor for tool assisted Event Storming.',
      link: '/workflows',
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
}
