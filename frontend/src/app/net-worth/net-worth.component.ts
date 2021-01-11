import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import { AssetAccountService, MonthAssetAccountEntryService } from '../services/api-object.service';

import { AssetAccount } from '../interfaces/asset-account';
import { MonthAssetAccountEntry } from '../interfaces/month-asset-account-entry';

@Component({
  selector: 'app-net-worth',
  templateUrl: './net-worth.component.html',
  styleUrls: ['./net-worth.component.css']
})
export class NetWorthComponent implements OnInit {

  faPlusSquare = faPlusSquare;

  assetAccounts: AssetAccount[];
  latestAssetAccountEntries: MonthAssetAccountEntry[];

  constructor(
      private assetAccountService: AssetAccountService,
      private monthAssetAccountEntryService: MonthAssetAccountEntryService,
      public addAssetAccountDialog: MatDialog
   ) { }

  ngOnInit(): void {
    this.getAssetAccounts();
    this.getLatestAssetAccountEntries();
  }

  openAddAssetAccountDialog(): void {
    const dialogRef = this.addAssetAccountDialog.open(AddAssetAccountDialog, {
        width: "250",
        data: {} as AssetAccount
    });

    dialogRef.afterClosed().subscribe(newAssetAccount => {
        if (newAssetAccount) {
            this.addAssetAccount(newAssetAccount);
        }
    });
  }

  addAssetAccount(assetAccount: AssetAccount): void {
      if (!assetAccount.name || !assetAccount.description) return;
      assetAccount.open_date = new Date();
      this.assetAccountService.addObject(assetAccount)
          .subscribe(newAssetAccount => {
              this.assetAccounts = [newAssetAccount].concat(this.assetAccounts);
          })
  }

  getAssetAccounts(): void {
    this.assetAccountService.getObjects()
        .subscribe(assetAccounts => {
            this.assetAccounts = assetAccounts;
        })
  }

  getLatestAssetAccountEntries(): void {
    this.monthAssetAccountEntryService.getObjectsWithParams({'month_info_id': 'latest'})
        .subscribe(accountEntries => {
            this.latestAssetAccountEntries = accountEntries;
        })
  }

  toggleAccountActivation(assetAccount: AssetAccount): void {
    if (assetAccount.close_date) {
      assetAccount.close_date = null;
    } else {
      assetAccount.close_date = new Date();
    }
    this.assetAccountService.updateObject(assetAccount)
        .subscribe(updatedAssetAccount => {
            assetAccount = updatedAssetAccount;
        })
  }

}

@Component({
  selector: 'add-asset-account-dialog',
  templateUrl: './add-asset-account-dialog.component.html'
})
export class AddAssetAccountDialog {

  constructor(
    public dialogRef: MatDialogRef<AddAssetAccountDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AssetAccount
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}