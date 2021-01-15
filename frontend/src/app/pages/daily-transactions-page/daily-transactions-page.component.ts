import { Component, OnInit } from '@angular/core';

import { InfoService } from '../../services/info.service';

@Component({
  selector: 'app-daily-transactions-page',
  templateUrl: './daily-transactions-page.component.html',
  styleUrls: ['./daily-transactions-page.component.css']
})
export class DailyTransactionsPageComponent implements OnInit {

  startDate: Date;

  constructor(private infoService: InfoService) { }

  ngOnInit(): void {
      this.getStartDate();
  }

  getStartDate(): void {
      this.infoService.getInfo("start_date")
          .subscribe(info => this.startDate = info.value);
  }

}
