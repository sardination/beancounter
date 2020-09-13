import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { BalanceSheetEntry } from '../interfaces/balance-sheet-entry';
import { BalanceSheetService } from '../services/api-object.service';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.css']
})
export class BalanceSheetComponent implements OnInit {

  balanceSheetEntries: BalanceSheetEntry[];

  constructor(
    private balanceSheetService: BalanceSheetService,
    public addEntryDialog: MatDialog
  ) { }

  ngOnInit(): void {
      this.getBalanceSheetEntries();
  }

  getAssets(): BalanceSheetEntry[] {
      return this.balanceSheetEntries.filter(entry => entry.entry_type.includes("asset"));
  }

  getAssetTotal(): number {
    if (this.balanceSheetEntries == undefined) return 0;
    return this.getAssets().reduce((sum, current) => sum + current.value, 0);
  }

  getLiabilityTotal(): number {
    if (this.balanceSheetEntries == undefined) return 0;
    return this.getLiabilities().reduce((sum, current) => sum + current.value, 0);
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

  openAddEntryDialog(): void {
    const dialogRef = this.addEntryDialog.open(AddEntryDialog, {
      width: "250",
      data: {} as BalanceSheetEntry
    });

    dialogRef.afterClosed().subscribe(newEntry => {
      if (newEntry) {
        this.addEntry(newEntry);
      }
    });
  }

  addEntry(entry: BalanceSheetEntry): void {
      if (!entry.value || !entry.entry_type || !entry.description) return;
      this.balanceSheetService.addObject(entry)
          .subscribe(newEntry => {
              this.balanceSheetEntries.unshift(newEntry);
          })
  }

  deleteEntry(entry: BalanceSheetEntry): void {
    this.balanceSheetService.deleteObject(entry)
        .subscribe(deletedEntry => {
          // have to use original entry due to addressing
          this.balanceSheetEntries.splice(this.balanceSheetEntries.indexOf(entry), 1);
        })
  }

}

@Component({
  selector: 'add-entry-dialog',
  templateUrl: './add-entry-dialog.component.html'
})
export class AddEntryDialog {

  entryTypes = [
    {key:'fixed_asset', label:"Fixed Asset"},
    {key:'liquid_asset', label:"Liquid Asset"},
    {key:'liability', label:"Liability"}
  ]

  constructor(
    public dialogRef: MatDialogRef<AddEntryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: BalanceSheetEntry
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}

