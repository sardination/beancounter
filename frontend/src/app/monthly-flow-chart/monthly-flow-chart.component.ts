import { Component, OnInit } from '@angular/core';
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

  private drawLineChart(): any {
    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var height = 500;
    var width = 2000;

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
           .domain([0, d3.max(this.monthInfos, d => Math.max(d.income, d.expenditure))])
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

    svg.append("path")
    		.datum(this.monthInfos)
    		.attr("class", "line")
    		.attr("d", incomeLine)
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-miterlimit", 1)
        .attr("stroke", "#0f0");
    svg.selectAll("income-circle")
       .data(this.monthInfos)
       .enter().append("circle")
       .attr("fill", "#0f0")
       .attr("r", 5)
       .attr("cx", function(d) {return x(new Date(d.year, d.month, 1))})
       .attr("cy", function(d) {return y(d.income)})

    svg.append("path")
        .datum(this.monthInfos)
        .attr("class", "line")
        .attr("d", expenditureLine)
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-miterlimit", 1)
        .attr("stroke", "#f00");
    svg.selectAll("expenditure-circle")
       .data(this.monthInfos)
       .enter().append("circle")
       .attr("fill", "#f00")
       .attr("r", 5)
       .attr("cx", function(d) {return x(new Date(d.year, d.month, 1))})
       .attr("cy", function(d) {return y(d.expenditure)})

    svg.append("path")
        .datum(this.monthInfos)
        .attr("class", "line")
        .attr("d", investmentIncomeLine)
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-miterlimit", 1)
        .attr("stroke", "#f00");
    svg.selectAll("investment-income-circle")
       .data(this.monthInfos)
       .enter().append("circle")
       .attr("fill", "#00f")
       .attr("r", 5)
       .attr("cx", function(d) {return x(new Date(d.year, d.month, 1))})
       .attr("cy", function(d) {return y(d.investment_income)})
  }

}
