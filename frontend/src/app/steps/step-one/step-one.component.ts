import { Component, OnInit } from '@angular/core';

import { InfoService } from '../../services/info.service';

@Component({
  selector: 'app-step-one',
  templateUrl: './step-one.component.html',
  styleUrls: ['./step-one.component.css']
})
export class StepOneComponent implements OnInit {

    startDate: Date;

  constructor(private infoService: InfoService) { }

  ngOnInit(): void {
      this.getStartDate();
  }

  getStartDate(): void {
      this.infoService.getInfo("start_date")
          .subscribe(info => this.startDate = info.value);
  }

  updateStartDate(date: Date): void {
      if (!date) return;
      this.infoService.updateInfo("start_date", date)
          .subscribe(info => {
              this.startDate = info.value;
          })
  }

}
