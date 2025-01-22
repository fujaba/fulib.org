import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-pro-tip',
  templateUrl: './pro-tip.component.html',
  styleUrls: ['./pro-tip.component.scss'],
  standalone: false,
})
export class ProTipComponent implements OnInit {
  @Input() tips: string[];
  tip = 0;

  ngOnInit(): void {
    this.tip = 0 | (Math.random() * this.tips.length);
  }

}
