import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter, map, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    private title: Title,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.route;
        let child: ActivatedRoute | undefined;
        while (child = route.children.find(c => c.outlet === 'primary')) {
          route = child;
        }
        return route;
      }),
      switchMap(route => route.data),
    ).subscribe(data => {
      const title = data?.title ? `${data.title} - fulib.org` : 'fulib.org';
      this.title.setTitle(title);
    });
  }
}
