import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { AssetAccount } from '../../interfaces/asset-account';
import { MonthAssetAccountEntry } from '../../interfaces/month-asset-account-entry';

@Component({
  selector: 'app-asset-account-table',
  templateUrl: './asset-account-table.component.html',
  styleUrls: ['./asset-account-table.component.css']
})
export class AssetAccountTableComponent implements OnInit {

  @Input()
  get latestAssetAccountEntries(): MonthAssetAccountEntry[] { return this._latestAssetAccountEntries; }
  set latestAssetAccountEntries(assetAccountEntries: MonthAssetAccountEntry[]) {
    this._latestAssetAccountEntries = assetAccountEntries;
    this.fillMap()
  }
  private _latestAssetAccountEntries: MonthAssetAccountEntry[];

  @Input()
  get assetAccounts(): AssetAccount[] { return this._assetAccounts };
  set assetAccounts(assetAccounts: AssetAccount[]) {
    this._assetAccounts = assetAccounts
    this.fillMap();
    if (!this.activeTableDataSource || !this.inactiveTableDataSource) {
       this.activeTableDataSource = new MatTableDataSource<AssetAccount>(this.getActiveAccounts());
       this.inactiveTableDataSource = new MatTableDataSource<AssetAccount>(this.getInactiveAccounts());
    } else {
       this.activeTableDataSource.data = this.getActiveAccounts();
       this.activeTableDataSource._updateChangeSubscription();

       this.inactiveTableDataSource.data = this.getInactiveAccounts();
       this.inactiveTableDataSource._updateChangeSubscription();
    }
  };
  private _assetAccounts: AssetAccount[];

  // key: account_id; value: month asset account entry
  assetAccountToEntryMap: Map<number, MonthAssetAccountEntry> = new Map<number, MonthAssetAccountEntry>();

  @Output() toggleAccountActivationEvent = new EventEmitter<AssetAccount>();

  activeTableDataSource: MatTableDataSource<AssetAccount>;
  activeColumnsToDisplay = ['name', 'assets', 'liabilities', 'description', 'open_date', 'toggle_activation'];

  inactiveTableDataSource: MatTableDataSource<AssetAccount>;
  inactiveColumnsToDisplay = ['name', 'open_date', 'close_date', 'description', 'toggle_activation'];

  constructor() { }

  ngOnInit(): void {
      this.activeTableDataSource = new MatTableDataSource<AssetAccount>(this.getActiveAccounts());
      this.inactiveTableDataSource = new MatTableDataSource<AssetAccount>(this.getInactiveAccounts());
  }

  toggleAccountActivation(assetAccount: AssetAccount): void {
    /*
    Emit activation toggle event and switch lists
    */
    if (this.activeTableDataSource.data.indexOf(assetAccount) > -1) {
      this.activeTableDataSource.data.splice(this.activeTableDataSource.data.indexOf(assetAccount), 1);
      this.inactiveTableDataSource.data = [assetAccount].concat(this.inactiveTableDataSource.data);
    } else {
      this.inactiveTableDataSource.data.splice(this.inactiveTableDataSource.data.indexOf(assetAccount), 1);
      this.activeTableDataSource.data = [assetAccount].concat(this.activeTableDataSource.data);
    }

    this.toggleAccountActivationEvent.emit(assetAccount);

    this.activeTableDataSource._updateChangeSubscription();
    this.inactiveTableDataSource._updateChangeSubscription();

    // this.investmentIncomes.splice(this.investmentIncomes.indexOf(income), 1);
    // if (this.editingIncome == null) {
    //   this.tableDataSource.data = this.investmentIncomes;
    // } else {
    //   this.tableDataSource.data = [this.editingIncome].concat(this.investmentIncomes);
    // }
    // this.tableDataSource._updateChangeSubscription();
  }

  getActiveAccounts(): AssetAccount[] {
      if (this.assetAccounts == undefined) return [];
      return this.assetAccounts.filter(assetAccount => !assetAccount.close_date);
  }

  getInactiveAccounts(): AssetAccount[] {
      if (this.assetAccounts == undefined) return [];
      return this.assetAccounts.filter(assetAccount => assetAccount.close_date);
  }

  fillMap(): void {
      if (this.latestAssetAccountEntries == undefined || this.assetAccounts == undefined) {
        return;
      }

      this.assetAccounts.forEach(
        assetAccount => {
          this.assetAccountToEntryMap.set(
            assetAccount.id, {asset_value: 0, liability_value: 0} as MonthAssetAccountEntry
          );
        }
      )

      this.latestAssetAccountEntries.forEach(
        assetAccountEntry => {
          this.assetAccountToEntryMap.set(assetAccountEntry.asset_account_id, assetAccountEntry);
        }
      )
  }

  getValueFromAccountID(account_id: number, asset: boolean) {
    /*
      account_id: account ID
      asset: true if getting asset value, false if getting liability value
    */
    if (this.assetAccountToEntryMap == undefined || !this.assetAccountToEntryMap.get(account_id)) {
      return 0;
    }

    if (asset) {
      return this.assetAccountToEntryMap.get(account_id).asset_value;
    } else {
      return this.assetAccountToEntryMap.get(account_id).liability_value;
    }
  }

}
