import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {map} from 'rxjs/operators';

interface Step {
  selector: string;
  title: string;
  description: string;
  route?: any[];
  skip?: number;
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
      selector: 'a[routerlink=tutorial]',
      title: 'Tutorial',
      description: `
      Welcome to Projects!
      This tutorial walks you through the different controls and views of the Project workspace.
      Click 'Next' to continue to the next step, or '×' to skip the tutorial.
      `,
    },
    {
      selector: 'app-project-workspace .sidebar',
      skip: 6,
      title: 'Sidebar',
      description: `
      The sidebar allows you manage many project-wide settings and overviews.
      `,
    },
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
    {
      selector: 'app-split-panel > as-split',
      skip: 3,
      title: 'Editor Area',
      description: 'This is where files appear when you select them in the Project Tree.',
    },
    {
      selector: 'app-file-tabs a.nav-link.close',
      title: 'New Scratch File',
      description: 'Use this button to create a new scratch file for writing down ideas or saving code for later.',
    },
    {
      selector: 'app-split-panel button[ngbtooltip=Split]',
      title: 'Split Panel',
      description: `
      You can create multiple sets of tabs to view files side-by-side.
      Drag and drop to move files between panels.
      `,
    },
    {
      selector: 'app-terminal-tabs > div',
      skip: 3,
      title: 'Terminals',
      description: 'The Terminal allows you to execute commands on the Project Container.',
    },
    {
      selector: 'app-terminal-tabs a.nav-link.close',
      title: 'New Terminal',
      description: 'Use this button to open a new shell.',
    },
    {
      selector: 'app-terminal-tabs div.dropdown',
      title: 'Active Processes',
      description: 'You can view and attach to running processes using this dropdown.',
    },
    {
      selector: 'a[routerlink=tutorial]',
      title: 'End of Tutorial',
      description: "You're all set and done with the tutorial, have fun with Projects!",
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
