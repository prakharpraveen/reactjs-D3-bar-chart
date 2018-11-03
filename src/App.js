import React, { Component } from 'react';
import { Element } from 'react-faux-dom';
import * as d3 from 'd3';
import './App.css';

import data from './data';
import moment from 'moment'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


class App extends Component {

    state = {
        startDate: moment(),
        endDate: moment(),
        dataOfUsers: [],
        viewType: "week",
        firstDate: ""
    }

    componentDidMount() {
        this.makeChartData((dataOfUsers) => this.setState({ dataOfUsers }))
    }

    makeChartData = (callback) => {
        let chartData = {};

        var sortedJsObjects = data.sort(function (a, b) {
            return new Date(a.startTime) - new Date(b.startTime)
        });
        let d = moment(sortedJsObjects[0].startTime) + moment().add(7, 'days');
        console.log(moment(d).format('MMMM Do YYYY, h:mm:ss a'));

        this.setState({ firstDate: moment(d).format('MMMM Do YYYY, h:mm:ss a') }, () => {

        });

        sortedJsObjects.forEach((item) => {
            var startTime = moment(item.startTime);
            if (this.state.firstDate > moment(item.startTime)) {
                return;
            }
            var stopTime = moment(item.stopTime);
            console.log("************");
            console.log(item);

            let differenceInMs = stopTime.diff(startTime);
            let duration = moment.duration(differenceInMs);
            let differenceInMinutes = duration.asMinutes();

            if (chartData[item.name] === undefined) {
                chartData[item.name] = parseInt(differenceInMinutes / 60)
            } else {
                chartData[item.name] = chartData[item.name] + parseInt(differenceInMinutes / 60);
            }

        });

        let userDetails = [];
        for (var property1 in chartData) {
            userDetails.push({ empName: property1, workHours: chartData[property1] });
        }
        callback(userDetails);
    }



    plot(chart, width, height) {
        const { dataOfUsers } = this.state;
        // create scales!
        const xScale = d3.scaleBand()
            .domain(dataOfUsers.map(d => d.empName))
            .range([0, width]);
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(dataOfUsers, d => d.workHours)])
            .range([height, 0]);
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        chart.selectAll('.bar')
            .data(dataOfUsers)
            .enter()
            .append('rect')
            .classed('bar', true)
            .attr('x', d => xScale(d.empName))
            .attr('y', d => yScale(d.workHours))
            .attr('height', d => (height - yScale(d.workHours)))
            .attr('width', d => xScale.bandwidth())
            .style('fill', (d, i) => colorScale(i));

        chart.selectAll('.bar-label')
            .data(dataOfUsers)
            .enter()
            .append('text')
            .classed('bar-label', true)
            .attr('x', d => xScale(d.empName) + xScale.bandwidth() / 2)
            .attr('dx', 0)
            .attr('y', d => yScale(d.workHours))
            .attr('dy', -6)
            .text(d => d.workHours);

        const xAxis = d3.axisBottom()
            .scale(xScale);

        chart.append('g')
            .classed('x axis', true)
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);

        const yAxis = d3.axisLeft()
            .ticks(5)
            .scale(yScale);

        chart.append('g')
            .classed('y axis', true)
            .attr('transform', 'translate(0,0)')
            .call(yAxis);

        chart.select('.x.axis')
            .append('text')
            .attr('x', width / 2)
            .attr('y', 60)
            .attr('fill', '#000')
            .style('font-size', '20px')
            .style('text-anchor', 'middle')
            .text('Employee name');

        chart.select('.y.axis')
            .append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('transform', `translate(-50, ${height / 2}) rotate(-90)`)
            .attr('fill', '#000')
            .style('font-size', '20px')
            .style('text-anchor', 'middle')
            .text('Work in hours');

        const yGridlines = d3.axisLeft()
            .scale(yScale)
            .ticks(5)
            .tickSize(-width, 0, 0)
            .tickFormat('')

        chart.append('g')
            .call(yGridlines)
            .classed('gridline', true);
    }

    drawChart() {
        const width = 800;
        const height = 450;

        const el = new Element('div');
        const svg = d3.select(el)
            .append('svg')
            .attr('id', 'chart')
            .attr('width', width)
            .attr('height', height);

        const margin = {
            top: 60,
            bottom: 100,
            left: 80,
            right: 40
        };

        const chart = svg.append('g')
            .classed('display', true)
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom
        this.plot(chart, chartWidth, chartHeight);

        return el.toReact();
    }

    handleChangeStart = (date) => {
        console.log(date);
        this.setState({
            startDate: date
        });
    }

    nextPrevHandaler = () => {
        const { dataOfUsers } = this.state;
        dataOfUsers.pop();
        this.setState({
            dataOfUsers
        })
    }

    render() {
        console.log(this);

        return (<div>
                    <div>
                        <button>Week</button>
                        <button>Month</button>
                    </div>
                    {this.drawChart()}
                    <DatePicker
                        selected={this.state.startDate}
                        selectsStart
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        onChange={this.handleChangeStart}
                    />

                    <DatePicker
                        selected={this.state.endDate}
                        selectsEnd
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        onChange={this.handleChangeEnd}
                    />
                    <div>
                        <button onClick={this.nextPrevHandaler}>Next</button>
                        <button onClick={this.nextPrevHandaler}>Previous</button>
                    </div>
                 </div>);
    }
}

export default App;
