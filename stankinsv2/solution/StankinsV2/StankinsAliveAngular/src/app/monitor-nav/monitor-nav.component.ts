import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, delay, debounceTime, distinctUntilChanged, reduce, scan } from 'rxjs/operators';
import * as signalR from '@aspnet/signalr';
import { ResultWithData } from '../DTO/HubDeclaration';
import { constructor } from 'q';
import { HubDataService } from '../hub-data.service';
import { forEach } from '@angular/router/src/utils/collection';
import {MatSnackBar} from '@angular/material';
@Component({
  selector: 'app-monitor-nav',
  templateUrl: './monitor-nav.component.html',
  styleUrls: ['./monitor-nav.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorNavComponent implements OnInit {


  isHandset$: Observable<boolean> = this.breakpointObserver
  .observe(Breakpoints.Handset)
  .pipe(map(result => result.matches));


  public tagsSet = new Set<string>();
  public tags = new Array<string>();
  public lastDateUpdated: Date;
  private  minDate  = new Date('0001-01-01T00:00:00Z');
  private subject = new Subject<string>();

  constructor(private snackBar: MatSnackBar, private breakpointObserver: BreakpointObserver,  private data: HubDataService) {
    this.subject.pipe(
      debounceTime(4000),
      scan(function(acc, x) {
        const count = (acc.match(/;/g) || []).length;
        if (count > 3) {
          acc = '';

        }
        const val = x + ';' + acc ;
        console.log(val);
        return val;
      }, ' ')
    )
    .subscribe(it => {

      this.snackBar.open(`Updating ${it}` , '' , {
        duration: 2000,
      });
    });

  }

  ngOnInit(): void {
    this.data.getData().subscribe(it => {
      if ((this.lastDateUpdated || this.minDate ) < it.aliveResult.startedDate) {
        this.lastDateUpdated = it.aliveResult.startedDate;
      }
      // console.log(`Updating ${it.customData.name}`);
      this.subject.next(`${it.customData.name}`);

      const size = this.tagsSet.size;
      for (const tag of it.customData.tags) {
          this.tagsSet.add(tag);
      }
      if (size !== this.tagsSet.size) {
        this.tags = Array.from(this.tagsSet).sort();
      }

    });
  }

  // https://twitter.com/davidfowl/status/998043928291983360
  adapt<T>(st: signalR.IStreamResult<T>): Observable<T> {
    const subject = new Subject<T>();
    st.subscribe(subject);
    return subject.asObservable();
  }
}
