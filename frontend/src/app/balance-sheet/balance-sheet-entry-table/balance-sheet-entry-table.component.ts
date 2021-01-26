import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { BalanceSheetEntry } from '../../interfaces/balance-sheet-entry';

@Component({
  selector: 'app-balance-sheet-entry-table',
  templateUrl: './balance-sheet-entry-table.component.html',
  styleUrls: ['./balance-sheet-entry-table.component.css']
})
export class BalanceSheetEntryTableComponent implements OnInit {

  faTrash = faTrash;

  @Input()
  get entries(): BalanceSheetEntry[] { return this._entries };
  set entries(entries: BalanceSheetEntry[]) {
    this._entries = entries;
    if (!this.tableDataSource) {
      this.tableDataSource = new MatTableDataSource<BalanceSheetEntry>(this._entries);
    } else {
      this.tableDataSource.data = this._entries;
      this.tableDataSource._updateChangeSubscription();
    }
  };
  private _entries: BalanceSheetEntry[];
  @Output() deleteEntryEvent = new EventEmitter<BalanceSheetEntry>();

  tableDataSource: MatTableDataSource<BalanceSheetEntry>;
  columnsToDisplay = ['value', 'description', 'delete'];

  constructor() { }

  ngOnInit(): void {
      this.tableDataSource = new MatTableDataSource<BalanceSheetEntry>(this.entries);
  }

  deleteEntry(entry: BalanceSheetEntry): void {
    this.deleteEntryEvent.emit(entry);
  }

  getAssetType(entry: BalanceSheetEntry): string {
    if (entry.entry_type == "fixed_asset") {
      return "(Fixed)";
    } else if (entry.entry_type == "liquid_asset") {
      return "(Liquid)";
    }

    return "";
  }

}
