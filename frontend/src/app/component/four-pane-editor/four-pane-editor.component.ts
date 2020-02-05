import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-four-pane-editor',
  templateUrl: './four-pane-editor.component.html',
  styleUrls: ['./four-pane-editor.component.scss']
})
export class FourPaneEditorComponent implements OnInit {
  scenarioText: string = 'test foo bar';
  javaCode: string = 'System.out.println("Hello World");';

  constructor() { }

  ngOnInit() {
  }

  submit(): void {
    console.log('submit');
  }
}
