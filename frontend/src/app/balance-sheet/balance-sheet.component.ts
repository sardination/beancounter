import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { BalanceSheetEntry } from '../interfaces/balance-sheet-entry';
import { BalanceSheetService } from '../services/api-object.service';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.css']
})
export class BalanceSheetComponent implements OnInit {

  balanceSheetEntries: BalanceSheetEntry[];

  assetDataSource: MatTableDataSource<BalanceSheetEntry>;
  liabilityDataSource: MatTableDataSource<BalanceSheetEntry>;
  columnsToDisplay = ['value', 'description'];

  constructor(private balanceSheetService: BalanceSheetService) { }

  ngOnInit(): void {
      this.getBalanceSheetEntries();
  }

  getAssets(): BalanceSheetEntry[] {
      return this.balanceSheetEntries.filter(entry => entry.entry_type.includes("asset"));
  }

  getLiabilities(): BalanceSheetEntry[] {
      return this.balanceSheetEntries.filter(entry => entry.entry_type == "liability");
  }

  getBalanceSheetEntries(): void {
      this.balanceSheetService.getObjects()
          .subscribe(balanceSheetEntries => {
              this.balanceSheetEntries = balanceSheetEntries;
          })
  }

}
