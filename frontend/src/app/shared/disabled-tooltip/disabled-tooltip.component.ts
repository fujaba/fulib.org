import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-disabled-tooltip',
  templateUrl: './disabled-tooltip.component.html',
  styleUrls: ['./disabled-tooltip.component.scss']
})
export class DisabledTooltipComponent {
  @Input() require: [boolean, string][]; // [condition, tooltip]

  isDisabled() {
    return this.require.some(([enabled, _]) => !enabled);
  }
}
