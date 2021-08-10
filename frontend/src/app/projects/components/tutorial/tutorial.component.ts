import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {map} from 'rxjs/operators';

interface Step {
  selector: string;
  title: string;
  description: string;
  route?: any[];
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
      route: [{outlets: {panel: 'project'}}],
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
    {
      route: [{outlets: {panel: 'launch'}}],
      selector: 'app-launch-panel > div',
      title: 'Launch Configurations',
      description: `
      This panel allows you to create reusable terminal configurations, e.g. build scripts.
      Click 'New' to create a new configuration, or view the options for the existing items.
      `,
    },
    {
      route: [{outlets: {panel: 'settings'}}],
      selector: 'app-settings > div',
      title: 'Settings',
      description: `
      You can configure other Project-specific settings here.
      Non-Local Projects can be configured to add contributors.
      Stay clear of the Danger Zone unless you know what you are doing!
      `,
    },
    {
      selector: 'a.sidebar-item[routerlink=search]',
      title: 'Search Everywhere',
      description: `
      Press Shift twice to open 'Search Everywhere'.
      It allows you to find any file in your project just by typing parts of the name.
      `,
    },
    {
      selector: 'a.sidebar-item[routerlink=run]',
      title: 'Run Anything',
      description: `
      Press Ctrl twice to open 'Run Anything'.
      It allows you to quickly run a one-off command.
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
    this.activatedRoute.params.pipe(
      map(({step}) => step),
    ).subscribe(step => {
      this.showStep(+step);
    });
  }

  ngAfterViewInit() {
    this.popover.open();
  }

  async showStep(index: number) {
    if (index >= this.steps.length) {
      return;
    }

    const step = this.steps[index];

    if (step.route) {
      await this.router.navigate(step.route, {relativeTo: this.activatedRoute.parent});
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const element = document.querySelector(step.selector) as HTMLElement;
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
    this.index = index;
  }

  leave() {
    this.router.navigate(['../..'], {relativeTo: this.activatedRoute});
  }
}
