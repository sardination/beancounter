import { Component, OnInit } from '@angular/core';

import { AssetAccountService } from '../../services/api-object.service';

@Component({
  selector: 'app-net-worth',
  templateUrl: './net-worth.component.html',
  styleUrls: ['./net-worth.component.css']
})
export class NetWorthComponent implements OnInit {

  constructor(private assetAccountService: AssetAccountService) { }

  ngOnInit(): void {
  }

}
