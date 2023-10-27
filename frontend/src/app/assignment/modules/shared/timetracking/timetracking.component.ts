import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {animationFrameScheduler, interval, Subscription} from "rxjs";
import {StorageService} from "../../../../services/storage.service";

@Component({
  selector: 'app-timetracking',
  templateUrl: './timetracking.component.html',
  styleUrls: ['./timetracking.component.scss'],
})
export class TimetrackingComponent {
  @Input() pauseOnBlur = false;
  @Input() duration = 0;
  @Output() durationChange = new EventEmitter<number>();

  startTime = 0;

  renderedTime = '0:00.00';

  subscription?: Subscription;

  get playing(): boolean {
    return !!this.startTime;
  }

  ngOnInit() {
    this.play();
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
    const totalTime = this.duration + (this.startTime ? (Date.now() - this.startTime) / 1000 : 0);
    const minutes = Math.floor(totalTime / 60) % 60;
    const seconds = totalTime % 60;
    this.renderedTime = `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
  }

  private stopRenderTimer() {
    this.subscription?.unsubscribe();
  }

  @HostListener('window:blur')
  onBlur() {
    if (!this.pauseOnBlur || !this.playing) {
      return;
    }
    this.pause();
  }

  playPause() {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.playing) {
      return;
    }
    this.startTime = Date.now();
    this.startRenderTimer();
  }

  pause() {
    if (!this.playing) {
      return;
    }
    this.duration += (Date.now() - this.startTime) / 1000;
    this.durationChange.emit(this.duration);
    this.startTime = 0;
    this.renderTime();
    this.stopRenderTimer();
  }
}
