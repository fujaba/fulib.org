import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';

interface Step {
  selector: string;
  title: string;
  description: string;
}

function findPos(obj: any): [number, number] {
  let top = 0;
  let left = 0;

  for (let parent = obj; parent; parent = parent.offsetParent) {
    top += parent.offsetTop;
    left += parent.offsetLeft;
  }
  return [top, left];
}

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent implements OnInit, AfterViewInit {
  @ViewChild('popover') popover: NgbPopover;

  steps: Step[] = [
    {
      selector: 'app-project-tree > div',
      title: 'Project Tree',
      description: `
      This panel shows all the files belonging to your project.
      Hover over one of them to show the available actions.
      You can also drag and drop to move files into folders.
      `,
    },
    {
      selector: 'app-split-panel > as-split',
      title: 'Editor Tabs',
      description: `
      This is where files appear when you select them in the Project Tree.
      Use the '+' button to open a new scratch file.
      You can create multiple sets of tabs to view files side-by-side using the button in the top left.
      Drag and drop to move files between panels.
      `,
    },
    {
      selector: 'app-terminal-tabs > div',
      title: 'Terminals',
      description: `
      The Terminal allows you to execute commands on the Project Container.
      Use the '+' button to open a new shell, or attach to an existing process using the button in the top left.
      `,
    },
  ];

  index = 0;

  targetPosition = {top: 0, left: 0, width: 0, height: 0};

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.showStep(0);
  }

  ngAfterViewInit() {
    this.popover.open();
  }

  showStep(index: number) {
    if (index >= this.steps.length) {
      return;
    }

    this.index = index;

    const element = document.querySelector(this.steps[this.index].selector) as HTMLElement;
    if (!element) {
      return;
    }

    const [top, left] = findPos(element);
    this.targetPosition = {
      top,
      left,
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  }

  leave() {
    this.router.navigate(['..'], {relativeTo: this.activatedRoute});
  }
}
