import { Component, OnInit } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  diagramUrl = 'http://127.0.0.1/api/process/diagram/defect';
  diagramImg: SafeHtml;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    const url = 'http://127.0.0.1/api/process/image';
    this.http.get(url, {
      headers: {
        Authorization: 'Basic d2poOnh4eA=='
      },
      responseType: 'text',
      params: {
        defineKey: 'defect',
        instanceId: 'c942d49d-050b-11e9-a96e-484d7e993162'
      }
    }).subscribe(data => {
      this.diagramImg = this.sanitizer.bypassSecurityTrustHtml(data);
    });
  }
}
