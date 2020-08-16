import { Component, OnInit } from '@angular/core';

import { ApiEndpointService } from '../../services/api-endpoint.service';

@Component({
  selector: 'app-step-one',
  templateUrl: './step-one.component.html',
  styleUrls: ['./step-one.component.css']
})
export class StepOneComponent implements OnInit {

    startDate: Date;

  constructor(private apiEndpointService: ApiEndpointService) { }

  ngOnInit(): void {
      this.getStartDate();
  }

  getStartDate(): void {
      this.apiEndpointService.getInfo("start_date")
          .subscribe(info => this.startDate = info.value);
  }

  updateStartDate(date: Date): void {
      if (!date) return;
      this.apiEndpointService.updateInfo("start_date", date)
          .subscribe(info => {
              this.startDate = info.value;
          })
  }

}
