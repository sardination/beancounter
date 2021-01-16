import { Component, OnInit, Input } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { faEdit, faCheck, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import {
  AssetAccountService,
  MonthAssetAccountEntryService
} from '../services/api-object.service';

import { AssetAccount } from '../interfaces/asset-account';
import { MonthAssetAccountEntry } from '../interfaces/month-asset-account-entry';

@Component({
  selector: 'app-monthly-asset-account-table',
  templateUrl: './monthly-asset-account-table.component.html',
  styleUrls: ['./monthly-asset-account-table.component.css']
})
export class MonthlyAssetAccountTableComponent implements OnInit {

  faEdit = faEdit;
  faCheck = faCheck;
  faQuestionCircle = faQuestionCircle;

  @Input()
  get monthAssetAccountEntries(): MonthAssetAccountEntry[] { return this._monthAssetAccountEntries };
  set monthAssetAccountEntries(monthAssetAccountEntries: MonthAssetAccountEntry[]) {
    this._monthAssetAccountEntries = monthAssetAccountEntries;
    this.fillMap();
  }
  private _monthAssetAccountEntries: MonthAssetAccountEntry[];
  editingAccount: AssetAccount;

  @Input()
  get monthInfoId(): number { return this._monthInfoId };
  set monthInfoId(monthInfoId: number) {
      this.cancelEditAccountEntry();
      this._monthInfoId = monthInfoId;
  }
  private _monthInfoId: number;

  assetAccounts: AssetAccount[];
  assetAccountToEntryMap: Map<number, MonthAssetAccountEntry> = new Map<number, MonthAssetAccountEntry>();

  tableDataSource: MatTableDataSource<AssetAccount>;
  columnsToDisplay = ['name', 'asset_value', 'liability_value', 'description', 'edit'];

  editingAssetValue: FormControl;
  editingLiabilityValue: FormControl;

  constructor(
    private assetAccountService: AssetAccountService,
    private monthAssetAccountEntryService: MonthAssetAccountEntryService
  ) { }

  ngOnInit(): void {
      this.getAssetAccounts();
  }

  getAssetAccounts(): void {
    this.assetAccountService.getObjectsWithParams({'month_info_id': this.monthInfoId})
        .subscribe(assetAccountList => {
            this.assetAccounts = assetAccountList;
            this.fillMap();

            if (!this.tableDataSource) {
              this.tableDataSource = new MatTableDataSource<AssetAccount>(this.assetAccounts);
            } else {
              this.tableDataSource.data = this.assetAccounts;
              this.tableDataSource._updateChangeSubscription();
            }
        })
  }

  fillMap(): void {
      if (this.monthAssetAccountEntries == undefined || this.assetAccounts == undefined) {
        return;
      }

      this.assetAccounts.forEach(
        assetAccount => {
          this.assetAccountToEntryMap.set(
            assetAccount.id, {
              asset_value: 0,
              liability_value: 0,
              asset_account_id: assetAccount.id,
              month_info_id: this.monthInfoId
            } as MonthAssetAccountEntry
          );
        }
      )

      this.monthAssetAccountEntries.forEach(
        assetAccountEntry => {
          this.assetAccountToEntryMap.set(assetAccountEntry.asset_account_id, assetAccountEntry);
        }
      )
  }

  accountEntryFromAccount(account: AssetAccount): MonthAssetAccountEntry {
    let assetAccountEntry = this.assetAccountToEntryMap.get(account.id);
    if (assetAccountEntry == undefined) {
      assetAccountEntry = {
        asset_value: 0,
        liability_value: 0,
        asset_account_id: account.id,
        month_info_id: this.monthInfoId
      } as MonthAssetAccountEntry;
    }
    return assetAccountEntry;
  }

  selectEditingAccount(editingAccount: AssetAccount): void {
    this.setFormControls(this.accountEntryFromAccount(editingAccount));
    this.tableDataSource.data = this.assetAccounts;
    this.editingAccount = editingAccount;
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
    this.tableDataSource.data = this.assetAccounts;
    this.editingAccount = null;
  }

  updateEditingAccountEntry(): void {
      this.tableDataSource.data = this.assetAccounts;
      this.updateEditingAccountEntryFromFormControls();
      var accountEntry = this.accountEntryFromAccount(this.editingAccount);

      if (!accountEntry.id) {
        this.monthAssetAccountEntryService.addObject(accountEntry)
            .subscribe(newAccountEntry => {
                this.monthAssetAccountEntries.push(newAccountEntry);
                this.monthAssetAccountEntries = this.monthAssetAccountEntries;
                this.tableDataSource.data = this.assetAccounts;
                this.editingAccount = null;
            })
      } else {
        this.monthAssetAccountEntryService.updateObject(accountEntry)
            .subscribe(updatedAccountEntry => {
                accountEntry = updatedAccountEntry;
                this.monthAssetAccountEntries = this.monthAssetAccountEntries;
                this.tableDataSource.data = this.assetAccounts;
                this.editingAccount = null;
            })
      }

      this.assetAccountToEntryMap.set(this.editingAccount.id, accountEntry);
  }

  updateEditingAccountEntryFromFormControls(): void {
    let editingAccountEntry = this.accountEntryFromAccount(this.editingAccount);
    if (editingAccountEntry != undefined) {
      editingAccountEntry.asset_value = this.editingAssetValue.value;
      editingAccountEntry.liability_value = this.editingLiabilityValue.value;
      this.assetAccountToEntryMap.set(this.editingAccount.id, editingAccountEntry);
    }
  }


}
