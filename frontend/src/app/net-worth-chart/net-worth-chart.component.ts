import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";

import { BaseMonthChartComponent } from '../base-month-chart/base-month-chart.component';

import { MonthInfo } from '../interfaces/month-info';

@Component({
  selector: 'app-net-worth-chart',
  template: '<svg></svg>',
  styleUrls: ['./net-worth-chart.component.css']
})
export class NetWorthChartComponent extends BaseMonthChartComponent implements OnInit {

  yDomain(): [number, number] {
    return [
        Math.min(0, d3.min(this.monthInfos, d => d.assets - d.liabilities)),
        Math.max(0, d3.max(this.monthInfos, d => Math.max(d.assets, d.liabilities)))
    ];
  }

  drawLines(svg: any, x: any, y: any): void {
    // create lines
    var assetLine = d3.line<MonthInfo>()
           .x(function(d) {return x(new Date(d.year, d.month, 1))})
           .y(function(d) {return y(d.assets)})
    var liabilityLine = d3.line<MonthInfo>()
            .x(function(d) {return x(new Date(d.year, d.month, 1))})
            .y(function(d) {return y(d.liabilities)});
    var netWorthLine = d3.line<MonthInfo>()
            .x(function(d) {return x(new Date(d.year, d.month, 1))})
            .y(function(d) {return y(d.assets - d.liabilities)});


    // draw lines
    this.drawLine(svg, this.monthInfos, assetLine, "#0f0");
    svg.selectAll("asset-circle")
       .data(this.monthInfos)
       .enter().append("circle")
       .attr("fill", "#0f0")
       .attr("r", 5)
       .attr("cx", function(d) {return x(new Date(d.year, d.month, 1))})
       .attr("cy", function(d) {return y(d.assets)})

    this.drawLine(svg, this.monthInfos, liabilityLine, "#f00");
    svg.selectAll("liability-circle")
       .data(this.monthInfos)
       .enter().append("circle")
       .attr("fill", "#f00")
       .attr("r", 5)
       .attr("cx", function(d) {return x(new Date(d.year, d.month, 1))})
       .attr("cy", function(d) {return y(d.liabilities)})

    this.drawLine(svg, this.monthInfos, netWorthLine, "#f00");
    svg.selectAll("net-worth-circle")
       .data(this.monthInfos)
       .enter().append("circle")
       .attr("fill", "#00f")
       .attr("r", 5)
       .attr("cx", function(d) {return x(new Date(d.year, d.month, 1))})
       .attr("cy", function(d) {return y(d.assets - d.liabilities)})

  }

}
