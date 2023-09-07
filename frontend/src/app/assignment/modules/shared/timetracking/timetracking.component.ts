import {Component} from '@angular/core';
import {animationFrameScheduler, interval, Subscription} from "rxjs";

@Component({
  selector: 'app-timetracking',
  templateUrl: './timetracking.component.html',
  styleUrls: ['./timetracking.component.scss'],
})
export class TimetrackingComponent {
  accTime = 0;
  startTime = 0;

  renderedTime = '0:00.00';

  subscription?: Subscription;

  ngOnInit() {
    this.renderTime();
  }

  ngOnDestroy() {
    this.stopRenderTimer();
  }

  private startRenderTimer() {
    this.subscription = interval(0, animationFrameScheduler).subscribe(() => {
      this.renderTime();
    });
  }

  private renderTime() {
    const totalTime = this.accTime + (this.startTime ? Date.now() - this.startTime : 0);
    const minutes = Math.floor(totalTime / 1000 / 60) % 60;
    const seconds = totalTime / 1000 % 60;
    this.renderedTime = `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
  }

  private stopRenderTimer() {
    this.subscription?.unsubscribe();
  }

  playPause() {
    if (!this.startTime) {
      // Start timer
      this.startTime = Date.now();
      this.startRenderTimer();
    } else {
      // Pause timer
      this.accTime += Date.now() - this.startTime;
      this.startTime = 0;
      this.renderTime();
      this.stopRenderTimer();
    }
  }
}
