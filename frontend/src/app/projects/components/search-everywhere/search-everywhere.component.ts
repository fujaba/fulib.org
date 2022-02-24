import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {of, OperatorFunction} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {SearchResult} from '../../model/search-result';
import {FileService} from '../../services/file.service';
import {ProjectManager} from '../../services/project.manager';
import {SearchService} from '../../services/search.service';

@Component({
  selector: 'app-search-everywhere',
  templateUrl: './search-everywhere.component.html',
  styleUrls: ['./search-everywhere.component.scss'],
})
export class SearchEverywhereComponent {
  search: OperatorFunction<string, SearchResult[]> = (text$) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    switchMap(term => term.length < 2
      ? of([])
      : this.searchService.search(this.projectManager.container, this.projectManager.fileRoot.path, term),
    ),
  );

  format = (result: SearchResult) => result.path.replace(this.projectManager.fileRoot.path, './');

  constructor(
    public route: ActivatedRoute,
    private searchService: SearchService,
    private projectManager: ProjectManager,
    private fileService: FileService,
  ) {
  }

  open(searchResult: SearchResult) {
    this.fileService.resolveAsync(this.projectManager.container, this.projectManager.fileRoot, searchResult.path).subscribe(file => {
      if (!file) {
        return;
      }
      this.projectManager.openEditor({
        file,
        temporary: false,
      });
    });
  }
}
