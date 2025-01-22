import {Component} from '@angular/core';
import {Observable} from "rxjs";
import Solution, {
  AuthorInfo,
  authorInfoProperties,
  Consent,
  consentKeys,
  ImportSolution
} from "../../../model/solution";
import {map} from "rxjs/operators";
import {SolutionService} from "../../../services/solution.service";
import {ActivatedRoute} from "@angular/router";
import {ImportTab} from '../import-tab.interface';

@Component({
  selector: 'app-import-consent',
  templateUrl: './import-consent.component.html',
  styleUrls: ['./import-consent.component.scss'],
  standalone: false,
})
export class ImportConsentComponent implements ImportTab {
  consentText = '';

  constructor(
    private solutionService: SolutionService,
    private route: ActivatedRoute,
  ) {
  }

  import() {
    const assignment = this.route.snapshot.params.aid;
    const lines = this.consentText.split('\n');
    const splitter = /[\t,;]/;
    const columns = lines[0].split(splitter);
    const updates: Partial<Solution>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(splitter);
      const author: AuthorInfo = {};
      const consent: Consent = {};
      for (let j = 0; j < columns.length; j++) {
        const column = columns[j].toLowerCase();
        const value = values[j];
        const authorInfo = authorInfoProperties.find(([, key]) => key.toLowerCase() === column);
        if (authorInfo) {
          author[authorInfo[1]] = value;
        }
        const consentKey = consentKeys.find(key => key.toLowerCase() === column);
        if (consentKey) {
          consent[consentKey] = Boolean(value.toLowerCase());
        }
      }
      if (Object.keys(author).length) {
        updates.push({author, consent});
      }
    }
    return this.solutionService.updateMany(assignment, updates).pipe(
      map(results => results.filter(s => s)),
      map(results => `Successfully updated ${results.length} solutions`),
    );
  }
}
