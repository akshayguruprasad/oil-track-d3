import { Component, OnInit, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';
import * as $ from 'jquery';
import { IFinData } from './IFinData';
import * as d3Scale from 'd3-scale';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  svg;
  frameWidth = 1800;
  frameHeight = 2000;
  minDomain;
  maxDomain;
  scaleX;
  scaleY;
  constructor() { }
  ngOnInit() {
    this.dashBoard();
  }

  dashBoard(): void {
    let finished = false;
    let finObject: IFinData;
    $.ajax({
      type: "GET",
      async: false,
      url: "https://www.quandl.com/api/v3/datasets/OPEC/ORB.json",
      contentType: "application/json;charset=utf-8",
      dataType: "json",
      success: function (data) {
        finObject = {} as IFinData;
        finObject.start = data.dataset.start_date,//start date
          finObject.end = data.dataset.end_date,//end date
          finObject.oilData = data.dataset.data//array of array
        finished = true;

      },
      error: function (ts) {
        alert("failed to work with the system")
        finished = true;
      }
    })
    this.setUpGraph(finObject);
  }
  setUpGraph(finData) {
    this.setUpScale(finData);
    let svg = this.setUpSVG(this.frameWidth, this.frameHeight);
    this.scaleUp();
    this.setUpLine(svg, this.formatInputData(finData.oilData))
    // this.setUpCircle(svg, this.formatInputData(finData.oilData))
    this.setUpAxes(svg)
  }
  setUpSVG(frameWidth, frameHeight) {
    let svgAtt = {
      width: frameWidth,
      height: frameHeight
    };
    return d3.select("div").select("svg");
  }
  parseDate(date) {
    return Date.parse(date)
  }
  setUpScale(dataForScale: IFinData) {
    this.minDomain = parseInt(Date.parse(dataForScale.start).toString());
    this.maxDomain = parseInt(Date.parse(dataForScale.end).toString());
  }
  setUpLine(svg, finData) {
    let scaleX = this.scaleX;
    let scaleY = this.scaleY;
    console.log(svg)
    d3.select('svg').append("rect").attr("width", this.frameWidth).attr("height", this.frameHeight).style("fill", "#353535")
    let lineFunction = d3.line().x(function (data) {
       let val = scaleX(parseInt(data.dateAsTime))

      return val;
    }).y(function (data) {
      return scaleY(parseFloat(data.oilPrice))
    }).curve(d3.curveMonotoneX);
    var lineGraph = d3.select('svg').select('rect').append("path")
      .attr("d", lineFunction(finData))
      .attr("stroke", "orange")
      .attr("stroke-width", .45)
      .attr("fill", "none");
  }
  formatInputData(data) {
    let formattedData = [];
    console.log(data)
    for (let i = 0; i < data.length; i++) {
      let objectToAdd = {
        dateAsTime: (Date.parse(data[i][0])),
        oilPrice: data[i][1]
      }
      formattedData.push(objectToAdd);
    }
    return formattedData;
  }
  /**  setUpCircle(svg, data) {
      let circleAttr = {
        cx: function (data) { return this.scaleX(parseInt(data.dateAsTime)); },
        cy: function (data) { return this.scaleY(parseFloat(data.oilPrice)); },
        r: "15",
        fill: "red"
      };
      svg.selectAll('circle').data(data).enter().append('circle').attr(circleAttr);
    } */
  scaleUp() {
    this.scaleX = d3Scale.linear().domain([this.minDomain, this.maxDomain]).range(0, this.frameWidth);
    this.scaleY = d3Scale.linear().domain([0, 180]).range(this.frameHeight, 0);
  }
  setUpAxes(svg) {
    let axis2 = d3.axisLeft(this.scaleY);
    svg.append("g").attr("transform", "translate(70, 30)").call(axis2)
    let axis1 = d3.axisBottom(this.scaleX);
    svg.append("g").attr("transform", "translate(70,1950)").call(axis1)
  }
}




