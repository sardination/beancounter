import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormControl } from '@angular/forms';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import {
  AssetAccountService,
  MonthAssetAccountEntryService,
  MonthInfoService,
} from '../services/api-object.service';

import { AssetAccount } from '../interfaces/asset-account';
import { MonthAssetAccountEntry } from '../interfaces/month-asset-account-entry';
import { MonthInfo } from '../interfaces/month-info';

@Component({
  selector: 'app-net-worth',
  templateUrl: './net-worth.component.html',
  styleUrls: ['./net-worth.component.css']
})
export class NetWorthComponent implements OnInit {

  faPlusSquare = faPlusSquare;

  assetAccounts: AssetAccount[];
  latestAssetAccountEntries: MonthAssetAccountEntry[];
  lastCompletedMonthInfo: MonthInfo;

  currentNetWorth: number = 0;

  constructor(
      private assetAccountService: AssetAccountService,
      private monthAssetAccountEntryService: MonthAssetAccountEntryService,
      private monthInfoService: MonthInfoService,
      public addAssetAccountDialog: MatDialog
   ) { }

  ngOnInit(): void {
    this.getAssetAccounts();
    this.getLastCompletedMonthInfo();
    // this.getLatestAssetAccountEntries();
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

  getLastCompletedMonthInfo(): void {
    /*
      Get the last completed month info and fill in the asset account entries
      if month info is given by calling getLatestAssetAccountEntries()
    */
    this.monthInfoService.getObjectsWithParams({'latest': "true"})
        .subscribe(monthInfos => {
            if (monthInfos.length > 0) {
                this.lastCompletedMonthInfo = monthInfos[0];
                this.getLatestAssetAccountEntries();
            }
        })
  }

  getLatestAssetAccountEntries(): void {
    /*
      Gets the asset account entries from the latest completed month
    */
    this.monthAssetAccountEntryService.getObjectsWithParams({'month_info_id': this.lastCompletedMonthInfo.id})
        .subscribe(accountEntries => {
            this.latestAssetAccountEntries = accountEntries;

            accountEntries.forEach((account) => {
                this.currentNetWorth += account.asset_value - account.liability_value;
            })
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

  getVerboseLatestCompletedMonth(): string {
    /*
      Returns month string (e.g. October 2020) from MonthInfo object
    */

    if (!this.lastCompletedMonthInfo) {
      return "";
    }
    const latestMonthDate = new Date(this.lastCompletedMonthInfo.year, this.lastCompletedMonthInfo.month, 1);
    return latestMonthDate.toLocaleString('default', { month: 'long' , year: 'numeric'});
  }

}

@Component({
  selector: 'add-asset-account-dialog',
  templateUrl: './add-asset-account-dialog.component.html'
})
export class AddAssetAccountDialog {

  currencyFormControl: UntypedFormControl

  constructor(
    public dialogRef: MatDialogRef<AddAssetAccountDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AssetAccount
  ) {
    this.data.currency = "USD"
  }

  ngOnInit() {
    this.currencyFormControl = new UntypedFormControl(this.data.currency)
    this.currencyFormControl.valueChanges.subscribe(value => {
      this.data.currency = value
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}