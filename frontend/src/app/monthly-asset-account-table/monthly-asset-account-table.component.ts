import { Component, OnInit, Input } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';

import { MonthAssetAccountEntryService } from '../services/api-object.service';

import { MonthAssetAccountEntry } from '../interfaces/month-asset-account-entry';

@Component({
  selector: 'app-monthly-asset-account-table',
  templateUrl: './monthly-asset-account-table.component.html',
  styleUrls: ['./monthly-asset-account-table.component.css']
})
export class MonthlyAssetAccountTableComponent implements OnInit {

  @Input()
  get monthAssetAccountEntries(): MonthAssetAccountEntry[] { return this._monthAssetAccountEntries };
  set monthAssetAccountEntries(monthAssetAccountEntries: MonthAssetAccountEntry[]) {
    this._monthAssetAccountEntries = monthAssetAccountEntries;
    if (!this.tableDataSource) {
      this.tableDataSource = new MatTableDataSource<MonthAssetAccountEntry>(this._monthAssetAccountEntries);
    } else {
      this.tableDataSource.data = this._monthAssetAccountEntries;
      this.tableDataSource._updateChangeSubscription();
    }
  }
  private _monthAssetAccountEntries: MonthAssetAccountEntry[];
  editingAccountEntry: MonthAssetAccountEntry;

  @Input()
  get monthInfoId(): number { return this._monthInfoId };
  set monthInfoId(monthInfoId: number) {
      this._monthInfoId = monthInfoId;
  }
  private _monthInfoId: number;

  tableDataSource: MatTableDataSource<MonthAssetAccountEntry>;
  columnsToDisplay = ['name', 'asset_value', 'liability_value', 'description', 'edit', 'delete'];

  editingAssetValue: FormControl;
  editingLiabilityValue: FormControl;

  constructor(private monthAssetAccountEntryService: MonthAssetAccountEntryService) { }

  ngOnInit(): void {
      this.tableDataSource = new MatTableDataSource<MonthAssetAccountEntry>(this.monthAssetAccountEntries);
  }

  selectEditingAccountEntry(editingAccountEntry: MonthAssetAccountEntry): void {
    this.setFormControls(editingAccountEntry);
    this.tableDataSource.data = this.monthAssetAccountEntries;
    this.editingAccountEntry = editingAccountEntry;
  }

  zeroFormControls(): void {
    this.editingAssetValue = new FormControl(0);
    this.editingLiabilityValue = new FormControl(0);
  }

  setFormControls(accountEntry: MonthAssetAccountEntry): void {
    this.editingAssetValue = new FormControl(accountEntry.asset_value);
    this.editingLiabilityValue = new FormControl(accountEntry.liability_value);
  }

  cancelEditAccountEntry(): void {
    this.tableDataSource.data = this.monthAssetAccountEntries;
    this.editingAccountEntry = null;
  }

  updateEditingAccountEntry(): void {
      this.tableDataSource.data = this.monthAssetAccountEntries;
      this.updateEditingAccountEntryFromFormControls();
      var accountEntry = this.editingAccountEntry;

      if (!accountEntry.id) {
        this.monthAssetAccountEntryService.addObject(accountEntry)
            .subscribe(newAccountEntry => {
                this.monthAssetAccountEntries.push(newAccountEntry);
                this.monthAssetAccountEntries = this.monthAssetAccountEntries;
                this.tableDataSource.data = this.monthAssetAccountEntries;
                this.editingAccountEntry = null;
            })
      } else {
        this.monthAssetAccountEntryService.updateObject(accountEntry)
            .subscribe(updatedAccountEntry => {
                accountEntry = updatedAccountEntry;
                this.monthAssetAccountEntries = this.monthAssetAccountEntries;
                this.tableDataSource.data = this.monthAssetAccountEntries;
                this.editingAccountEntry = null;
            })
      }
  }

  updateEditingAccountEntryFromFormControls(): void {
    if (this.editingAccountEntry != undefined) {
      this.editingAccountEntry.asset_value = this.editingAssetValue.value;
      this.editingAccountEntry.liability_value = this.editingLiabilityValue.value;
    }
  }

  deleteAccountEntry(assetAccount: MonthAssetAccountEntry): void {
    this.monthAssetAccountEntryService.deleteObject(assetAccount)
        .subscribe(deletedAssetAccount => {
          // have to use original entry due to addressing
          this.monthAssetAccountEntries.splice(this.monthAssetAccountEntries.indexOf(assetAccount), 1);
          if (this.editingAccountEntry == null) {
            this.tableDataSource.data = this.monthAssetAccountEntries;
          } else {
            this.tableDataSource.data = [this.editingAccountEntry].concat(this.monthAssetAccountEntries);
          }
          this.tableDataSource._updateChangeSubscription();
        })
  }

}
