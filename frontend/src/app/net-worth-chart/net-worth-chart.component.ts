import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";
import { legendColor } from "d3-svg-legend";

import { BaseMonthChartComponent } from '../base-month-chart/base-month-chart.component';

import { MonthInfo } from '../interfaces/month-info';

@Component({
  selector: 'app-net-worth-chart',
  template: '<svg id="{{ svgID }}"></svg>',
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

    // fill space between assets and liability lines to indicate net worth
    var areaAboveAssetLine = d3.area<MonthInfo>()
            .x(assetLine.x())
            .y0(assetLine.y())
            .y1(this.yDomain()[1])
    var areaBelowAssetLine = d3.area<MonthInfo>()
            .x(assetLine.x())
            .y0(this.yDomain()[0])
            .y1(assetLine.y())
    var areaAboveLiabilityLine = d3.area<MonthInfo>()
            .x(liabilityLine.x())
            .y0(liabilityLine.y())
            .y1(this.yDomain()[1])
    var areaBelowLiabilityLine = d3.area<MonthInfo>()
            .x(liabilityLine.x())
            .y0(this.yDomain()[0])
            .y1(liabilityLine.y())

    var defs = svg.append('defs');
    defs.append('clipPath')
      .attr('id', 'clip-asset')
      .append('path')
      .datum(this.monthInfos)
      .attr('d', areaAboveAssetLine);
    defs.append('clipPath')
      .attr('id', 'clip-liability')
      .append('path')
      .datum(this.monthInfos)
      .attr('d', areaAboveLiabilityLine);

    // ASSET IS ABOVE LIABILITY
    svg.append('path')
      .datum(this.monthInfos)
      .attr('d', areaBelowAssetLine)
      .attr('clip-path', 'url(#clip-liability)')
      .attr("fill", "#ddd")

    // LIABILITY IS ABOVE ASSET
    svg.append('path')
      .datum(this.monthInfos)
      .attr('d', areaBelowLiabilityLine)
      .attr('clip-path', 'url(#clip-asset)')
      .attr("fill", "#ddd")

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

    this.drawLine(svg, this.monthInfos, netWorthLine, "#444");
    svg.selectAll("net-worth-circle")
       .data(this.monthInfos)
       // .join("text")
       //   .text(d => d.assets - d.liabilities)
       //   .attr("dy", "-0.5em")
       //   .attr("dx", "-0.5em")
       //   .attr("x", function(d) {return x(new Date(d.year, d.month, 1))})
       //   .attr("y", function(d) {return y(d.assets - d.liabilities)})
       .attr("cx", function(d) {return x(new Date(d.year, d.month, 1))})
       .attr("cy", function(d) {return y(d.assets - d.liabilities)})

    // create legend
    var ordinal = d3.scaleOrdinal()
      .domain(["Assets", "Liabilities", "Net Worth"])
      .range([ "#0f0", "#f00", "#444" ]);
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
