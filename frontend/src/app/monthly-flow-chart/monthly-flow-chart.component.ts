import { Component, OnInit, Input } from '@angular/core';
import * as d3 from "d3";

import { MonthInfoService } from '../services/api-object.service';

import { MonthInfo } from '../interfaces/month-info';

@Component({
  selector: 'app-monthly-flow-chart',
  templateUrl: './monthly-flow-chart.component.html',
  styleUrls: ['./monthly-flow-chart.component.css']
})
export class MonthlyFlowChartComponent implements OnInit {

  monthInfos: MonthInfo[] = [];
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

  constructor(private monthInfoService: MonthInfoService) { }

  ngOnInit(): void {
  	this.getMonthInfos();
  }

  getMonthInfos(): void {
      this.monthInfoService.getObjects()
          .subscribe(monthInfos => {
              this.monthInfos = monthInfos.sort((a, b) => {
                  if (a.year < b.year) {
                      return -1;
                  } else if (a.year > b.year) {
                      return 1;
                  } else {
                      if (a.month < b.month) {
                          return -1;
                      } else if (a.month > b.month) {
                          return 1;
                      }
                  }
                  return 0;
              }).filter(monthInfo => monthInfo.completed)
              if (this.monthInfos.length > 0) {
                  var today = new Date();
                  let finalMonthInfo = this.monthInfos[this.monthInfos.length - 1];
                  if (finalMonthInfo.month == today.getMonth() + 1 &&
                      finalMonthInfo.year == today.getFullYear()) {
                        this.monthInfos.pop();
                  }
              }
			  	  this.drawLineChart();
          })
  }

  private drawLine(svg: any, data: any[], line: any, color: string): void {
    // Draws an individual line
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-miterlimit", 1)
        .attr("stroke", color);
  }

  private drawLineChart(): any {
    // Draws the full chart

    if (this.monthInfos.length == 0) return;

    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var height = 500;
    var width = 2000;

    // clear svg
    d3.selectAll("svg > *").remove();

    // create svg
    let svg = d3.select("svg")
           .attr("width", '100%')
           .attr("height", '50%')
           .attr('viewBox','0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
           .attr('preserveAspectRatio','xMinYMin')
           .append("g")
           .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // add axes
    let x = d3.scaleUtc()
           .domain(d3.extent(this.monthInfos, d => new Date(d.year, d.month, 1)))
           .range([margin.left, width]);
    let y = d3.scaleLinear()
           .domain([0, Math.max(d3.max(this.monthInfos, d => Math.max(d.income, d.expenditure)), this.averageMonthlyExpense)])
           .range([height, margin.top]);

    svg.append("g")
        .attr('transform', 'translate(0,' + (height) + ')')
        .call(d3.axisBottom(x).ticks(d3.timeMonth).tickFormat(d3.timeFormat("%b %Y")));
    svg.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y));

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
              capital += d.income - d.expenditure;
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
  }

}
