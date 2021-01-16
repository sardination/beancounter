import { Component, OnInit, Inject, Input } from '@angular/core';
import * as d3 from "d3";
import { legendColor } from "d3-svg-legend";

import { BaseMonthChartComponent } from '../base-month-chart/base-month-chart.component';

import { MonthInfo } from '../interfaces/month-info';

@Component({
  selector: 'app-monthly-flow-chart',
  template: '<svg id="{{ svgID }}"></svg>',
  styleUrls: ['./monthly-flow-chart.component.css']
})
export class MonthlyFlowChartComponent extends BaseMonthChartComponent implements OnInit {

  @Input()
  set averageMonthlyExpense(averageMonthlyExpense: number) {
    if (averageMonthlyExpense == undefined) return;
    this._averageMonthlyExpense = averageMonthlyExpense;
    this.drawLineChart();
  }
  get averageMonthlyExpense(): number { return this._averageMonthlyExpense }
  private _averageMonthlyExpense: number = 0;

  @Input()
  set longTermInterestRate(longTermInterestRate: number) {
    if (longTermInterestRate == undefined) return;
    this._longTermInterestRate = longTermInterestRate;
    this.drawLineChart();
  }
  get longTermInterestRate(): number { return this.longTermInterestRate }
  private _longTermInterestRate: number = 0;

  // define abstract methods:
  yDomain(): [number, number] {
    return [0, Math.max(d3.max(this.monthInfos, d => Math.max(d.income, d.expenditure)), this.averageMonthlyExpense)];
  }

  drawLines(svg: any, x: any, y: any): void {
    // create lines
    var incomeLine = d3.line<MonthInfo>()
           .x(function(d) {return x(new Date(d.year, d.month, 1))})
           .y(function(d) {return y(d.income)})
    var expenditureLine = d3.line<MonthInfo>()
            .x(function(d) {return x(new Date(d.year, d.month, 1))})
            .y(function(d) {return y(d.expenditure)});
    var investmentIncomeLine = d3.line<MonthInfo>()
            .x(function(d) {return x(new Date(d.year, d.month, 1))})
            .y(function(d) {return y(d.investment_income)});

    // create projection lines
    var expenditureProjectionLine = d3.line<MonthInfo>()
            .x(function(d) {return x(new Date(d.year, d.month, 1))})
            .y(y(this.averageMonthlyExpense));
    // TODO: make this a function of actual accumulated capital => requires savings tracking + monitoring, good practice!
    var capital = 0;
    var _this = this;
    var investmentIncomeProjectionLine = d3.line<MonthInfo>()
            .x(function(d) {return x(new Date(d.year, d.month, 1))})
            .y(function(d) {
              // capital += d.income - d.expenditure;
              capital = d.assets - d.liabilities
              return y(capital * _this._longTermInterestRate / 12);
            })

    // draw lines
    this.drawLine(svg, this.monthInfos, incomeLine, "#0f0");
    svg.selectAll("income-circle")
       .data(this.monthInfos)
       .enter().append("circle")
       .attr("fill", "#0f0")
       .attr("r", 5)
       .attr("cx", function(d) {return x(new Date(d.year, d.month, 1))})
       .attr("cy", function(d) {return y(d.income)})

    this.drawLine(svg, this.monthInfos, expenditureLine, "#f00");
    svg.selectAll("expenditure-circle")
       .data(this.monthInfos)
       .enter().append("circle")
       .attr("fill", "#f00")
       .attr("r", 5)
       .attr("cx", function(d) {return x(new Date(d.year, d.month, 1))})
       .attr("cy", function(d) {return y(d.expenditure)})

    this.drawLine(svg, this.monthInfos, investmentIncomeLine, "#f00");
    svg.selectAll("investment-income-circle")
       .data(this.monthInfos)
       .enter().append("circle")
       .attr("fill", "#00f")
       .attr("r", 5)
       .attr("cx", function(d) {return x(new Date(d.year, d.month, 1))})
       .attr("cy", function(d) {return y(d.investment_income)})

    // draw projection lines
    this.drawLine(svg, this.monthInfos, expenditureProjectionLine, "#ccc");
    this.drawLine(svg, this.monthInfos, investmentIncomeProjectionLine, "#165");

    // create legend
    var ordinal = d3.scaleOrdinal()
      .domain(["Income", "Expenditure", "Investment Income", "Projected Expenditure", "Projected Investment Income"])
      .range([ "#0f0", "#f00", "#00f", "#ccc", "#165" ]);
    svg.append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", "translate(20,20)");
    var legendOrdinal = legendColor()
      .shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
      .shapePadding(10)
      .scale(ordinal);
    svg.select(".legendOrdinal")
      .call(legendOrdinal);

  }

}
