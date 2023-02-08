import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfigService} from '../../services/config.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  @ViewChild('configModal', {static: true}) configModal: TemplateRef<any>;

  needsConfig = !this.configService.get('name');

  constructor(
    private configService: ConfigService,
    private modal: NgbModal,
  ) {
  }

  ngOnInit() {
    if (!this.configService.get('name')) {
      this.modal.open(this.configModal);
    }
  }
}
