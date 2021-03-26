import {NgModule} from '@angular/core';
import {RouterModule, Routes, UrlMatcher, UrlMatchResult, UrlSegment} from '@angular/router';
import {OverviewComponent} from './overview/overview.component';
import {PageComponent} from './page/page.component';

const repoPathMatcher: UrlMatcher = (segments: UrlSegment[]): UrlMatchResult | null => {
  if (segments.length < 1) {
    return null;
  }
  const mergedPath = segments.slice(1).map(segment => segment.path).join('/');
  const repoSegment: UrlSegment = new UrlSegment(segments[0].path, {repo: segments[0].path});
  const pageSegment: UrlSegment = new UrlSegment(mergedPath, {page: mergedPath});
  return {consumed: segments, posParams: {repo: repoSegment, page: pageSegment}};
};

const routes: Routes = [
  {matcher: repoPathMatcher, component: PageComponent},
  {path: '', component: OverviewComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocsRoutingModule {
}
