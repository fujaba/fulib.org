import {Component, HostListener, Input} from '@angular/core';
import {animationFrameScheduler, interval, Subscription} from "rxjs";

@Component({
  selector: 'app-timetracking',
  templateUrl: './timetracking.component.html',
  styleUrls: ['./timetracking.component.scss'],
})
export class TimetrackingComponent {
  readonly actionName = {
    viewSolutionTable: 'Viewing Solution Table',
    viewSolution: 'Viewing Solution',
    idle: 'Idling...',
  };

  @Input() action = 'idle';
  @Input() pauseOnBlur = false;

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

  @HostListener('window:blur')
  onBlur() {
    if (!this.startTime || !this.pauseOnBlur) {
      return;
    }
    this.pause();
  }

  playPause() {
    if (!this.startTime) {
      this.play();
    } else {
      this.pause();
    }
  }

  private play() {
    this.startTime = Date.now();
    this.startRenderTimer();
  }

  private pause() {
    this.accTime += Date.now() - this.startTime;
    this.startTime = 0;
    this.renderTime();
    this.stopRenderTimer();
  }
}
