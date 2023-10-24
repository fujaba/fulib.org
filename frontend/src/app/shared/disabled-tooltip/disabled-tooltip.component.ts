import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-disabled-tooltip',
  templateUrl: './disabled-tooltip.component.html',
  styleUrls: ['./disabled-tooltip.component.scss']
})
export class DisabledTooltipComponent implements OnChanges {
  @Input() class?: string;
  @Input() require: [boolean, string][]; // [condition, tooltip]

  disabled = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.require) {
      this.disabled = this.require.some(([condition, _]) => !condition);
    }
  }
}
