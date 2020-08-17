import { Component, OnInit } from '@angular/core';

import { ApiEndpointService } from '../services/api-endpoint.service';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.css']
})
export class BalanceSheetComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
