import { Component, OnInit } from '@angular/core';

import { Transaction } from '../interfaces/transaction';
import { ApiEndpointService } from '../services/api-endpoint.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {

  transactions: Transaction[];
  selectedTransaction: Transaction;

  constructor(private apiEndpointService: ApiEndpointService) { }

  ngOnInit(): void {
    this.getTransactions();
  }

  onSelect(transaction: Transaction): void {
      this.selectedTransaction = transaction;
  }

  getTransactions(): void {
    // this.transactions = this.transactionService.getTransactions();
    this.apiEndpointService.getTransactions()
      .subscribe(transactions => this.transactions = transactions);
  }

}
