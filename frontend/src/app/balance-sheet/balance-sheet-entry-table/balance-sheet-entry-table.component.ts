import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { BalanceSheetService } from '../../services/api-object.service';

import { BalanceSheetEntry } from '../../interfaces/balance-sheet-entry';

@Component({
  selector: 'app-balance-sheet-entry-table',
  templateUrl: './balance-sheet-entry-table.component.html',
  styleUrls: ['./balance-sheet-entry-table.component.css']
})
export class BalanceSheetEntryTableComponent implements OnInit, OnChanges {

  @Input() entries: BalanceSheetEntry[];

  tableDataSource: MatTableDataSource<BalanceSheetEntry>;
  columnsToDisplay = ['value', 'description', 'delete'];

  constructor(private balanceSheetService: BalanceSheetService) { }

  ngOnInit(): void {
      this.tableDataSource = new MatTableDataSource<BalanceSheetEntry>(this.entries);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.entries.previousValue) {
      this.tableDataSource.data = changes.entries.currentValue;
      this.tableDataSource._updateChangeSubscription();
    }
  }

  deleteEntry(entry: BalanceSheetEntry): void {
    this.balanceSheetService.deleteObject(entry)
        .subscribe(deletedEntry => {
          this.entries.splice(this.entries.indexOf(deletedEntry), 1);
          this.tableDataSource.data = this.entries;
          this.tableDataSource._updateChangeSubscription();
        })
  }

}
