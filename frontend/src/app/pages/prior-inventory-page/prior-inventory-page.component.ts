import { Component, OnInit } from '@angular/core';

import { InfoService } from '../../services/info.service';

@Component({
  selector: 'app-prior-inventory-page',
  templateUrl: './prior-inventory-page.component.html',
  styleUrls: ['./prior-inventory-page.component.css']
})
export class PriorInventoryPageComponent implements OnInit {

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
              console.log(info);
              this.startDate = info.value;
          })
  }

}
