import {
  AfterContentInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  SimpleChanges,
  EventEmitter
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { map, catchError, retry } from 'rxjs/operators';

/**
 * You may include a different variant of BpmnJS:
 *
 * Viewer  - displays BPMN diagrams without the ability
 *           to navigate them
 * Modeler - bootstraps a full-fledged BPMN editor
 */
import BpmnJS from 'bpmn-js/lib/Modeler';
import { importDiagram } from './rx';
import { throwError } from 'rxjs';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn';
import customTranslate from './translate/customTranslate';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.css']
})
export class DiagramComponent implements AfterContentInit, OnChanges, OnDestroy {
  private bpmnJS: BpmnJS;
  svgImg: any;

  @ViewChild('canvas') private canvas: ElementRef;
  @ViewChild('properties') private properties: ElementRef;
  @Output() private importDone: EventEmitter<any> = new EventEmitter();
  @Output() private saveSuccess: EventEmitter<any> = new EventEmitter();

  @Input() private url: string;

  constructor(private http: HttpClient) {
    const customTranslateModule = {
      translate: [ 'value', customTranslate ]
    };
    this.bpmnJS = new BpmnJS({
      additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule,
        customTranslateModule
      ]
    });

    this.bpmnJS.on('import.done', ({ error }) => {
      if (!error) {
        this.bpmnJS.get('canvas').zoom('fit-viewport');
      }
    });
  }

  ngAfterContentInit(): void {
    this.bpmnJS.attachTo(this.canvas.nativeElement);
    const propertiesPanel = this.bpmnJS.get('propertiesPanel');
    // detach the panel
    propertiesPanel.detach();
    // attach it to some other element
    propertiesPanel.attachTo(this.properties.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges) {
    // re-import whenever the url changes
    if (changes.url && changes.url.currentValue) {
      this.loadUrl(changes.url.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.bpmnJS.destroy();
  }

  /**
   * Load diagram from URL and emit completion event
   */
  loadUrl(url: string) {
    return (
      this.http.get(url, {
        headers: {
          Authorization: 'Basic d2poOnh4eA=='
        },
        responseType: 'text',
      }).pipe(
        catchError(err => throwError(err)),
        importDiagram(this.bpmnJS)
      ).subscribe(
        (warnings) => {
          this.importDone.emit({
            type: 'success',
            warnings
          });
        },
        (err) => {
          this.importDone.emit({
            type: 'error',
            error: err
          });
        }
      )
    );
  }

  loadXml(bpmnJS: any, xml: string) {
    bpmnJS.importXML(xml, function(err, warnings) {
      if (err) {
        console.error(err);
      }
      if (warnings) {
        console.log(warnings);
      }
    });
  }

  newDiagram() {
    this.http.get('../../assets/newDiagram.bpmn', {
      responseType: 'text'
    }).subscribe((diagramXML: string) => {
      this.loadXml(this.bpmnJS, diagramXML);
    });
  }

  save() {
    this.bpmnJS.saveXML((error, xml) => {
      console.log(error);
      console.log(xml);
      const url = 'http://127.0.0.1/api/diagram/create';
      this.http.post(url, xml, {
        headers: {
          Authorization: 'Basic d2poOnh4eA=='
        },
      }).subscribe(response => {
        console.log(response);
        this.saveSuccess.emit(true);
      });
    });
  }

  downloadImage() {
    this.bpmnJS.saveSVG((error, svgXml) => {
      console.log(error);
      console.log(svgXml);
    });
  }
}
