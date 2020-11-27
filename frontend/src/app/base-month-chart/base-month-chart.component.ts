import { Component, OnInit, Input } from '@angular/core';
import * as d3 from "d3";

import { MonthInfoService } from '../services/api-object.service';

import { MonthInfo } from '../interfaces/month-info';

@Component({
  template: '<svg></svg>'
})
export abstract class BaseMonthChartComponent implements OnInit {

  monthInfos: MonthInfo[] = [];

  abstract yDomain(): [number, number];
  abstract drawLines(svg: any, x: any, y: any): void;

  constructor(protected monthInfoService: MonthInfoService) { }

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

  drawLine(svg: any, data: any[], line: any, color: string): void {
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

  drawLineChart(): any {
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
           .domain(this.yDomain())
           .range([height, margin.top]);

    svg.append("g")
        .attr('transform', 'translate(0,' + (height) + ')')
        .call(d3.axisBottom(x).ticks(d3.timeMonth).tickFormat(d3.timeFormat("%b %Y")));
    svg.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y));

    this.drawLines(svg, x, y);
  }

}
