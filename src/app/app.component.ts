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
  baseUrl = 'http://127.0.0.1/api';
  processDefines = [];
  diagramImg: SafeHtml;
  diagramUrl: string;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.getProcessDefines();
  }

  getProcessDefines() {
    this.http.get(`${this.baseUrl}/process/defines`, {
      headers: this.getAuthHeader()
    }).subscribe(response => {
      this.processDefines = response['content'];
    });
  }

  showProcessSatus(defineId: string, instanceId: string) {
    this.http.get(`${this.baseUrl}/process/image`, {
      headers: this.getAuthHeader(),
      responseType: 'text',
      params: {
        defineId: defineId,
        instanceId: instanceId
      }
    }).subscribe(data => {
      this.diagramImg = this.sanitizer.bypassSecurityTrustHtml(data);
    });
  }

  showProcessDefine(defineId: string) {
    this.diagramUrl = `${this.baseUrl}/diagram/${defineId}`;
  }

  deleteProcess(defineId: string) {
    this.http.delete(`${this.baseUrl}/diagram/${defineId}`, {
      headers: this.getAuthHeader()
    }).subscribe(response => {
      console.log(response);
      this.refresh();
    });
  }

  refresh() {
    this.diagramImg = null;
    this.diagramUrl = null;
    this.getProcessDefines();
  }

  getAuthHeader() {
    const username = 'wjh';
    const password = 'xxx';
    return {
      Authorization: 'Basic ' + btoa(username + ':' + password)
    };
  }
}
