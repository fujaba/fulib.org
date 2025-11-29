import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {NgbTooltip} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-disabled-tooltip',
  templateUrl: './disabled-tooltip.component.html',
  styleUrls: ['./disabled-tooltip.component.scss'],
  imports: [NgbTooltip],
})
export class DisabledTooltipComponent implements OnChanges {
  @Input() class?: string;
  @Input() require: [boolean, string][]; // [condition, tooltip]

  disabled = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.require) {
      this.disabled = this.require.some(([condition]) => !condition);
    }
  }
}
