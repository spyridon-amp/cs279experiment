/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 */

/**
 * LineVis object
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array (should be only one person)
 * @param _coords -- the coordinates displayed (between coordinates, mcoordinates, rcoordinates)
 * @constructor
 */
LineVis = function(_parentElement, _data, _coords){
    this.parentElement = _parentElement;
    this.data = _data;
    this.coords = _coords;

    this.margin = {top:20, right: 20, bottom: 30, left: 35};
    this.width = $(this.parentElement).width() - this.margin.left - this.margin.right;
    this.height = 600 - this.margin.top - this.margin.bottom;

    this.initVis();
};

/**
 * Method that sets up the SVG and the variables
 */
LineVis.prototype.initVis = function(){

    var that = this;

    this.svg = d3.select(this.parentElement).append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.x = d3.scaleLinear()
        .range([0, this.width]);

    this.y = d3.scaleLinear()
        .range([this.height, 0]);

    this.color = function(d) {
        var colors = ["#66c2a5", "#ffaa99", "#0000ff"];
        if ((d.area < 1 && d.selection === "rightImage") || (d.area > 1 && d.selection === "leftImage"))
            return colors[2];
        else if (d.selection === "leftImage")
            return colors[0];
        else
            return colors[1];
    };

    this.x.domain(dataExt(allData, this.coords, "x"));
    this.y.domain(dataExt(allData, this.coords, "y"));

    this.xAxis = d3.axisBottom(this.x);
    this.yAxis = d3.axisLeft(this.y);

    // Add the x Axis
    this.svg.append("g")
        .attr("class", "x axis")
        .style("font", "12px sans-serif")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis);

    // Add the y Axis
    this.svg.append("g")
        .attr("class", "y axis")
        .style("font", "12px sans-serif")
        .call(this.yAxis)
        .selectAll("text")
        .style("font", "12px sans-serif");

    this.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 1)
        .attr("dy", ".85em")
        .style("text-anchor", "end")
        .text(this.coords);

    this.line = d3.line()
        // .interpolate("basis")
        .x(function(d) { return that.x(d.x); })
        .y(function(d) { return that.y(d.y); });

    this.x.domain(dataExt(this.data, this.coords, "x"));
    this.y.domain(dataExt(this.data, this.coords, "y"));

    var round = this.svg.append("g").attr("class", "round").selectAll(".line")
        .data(this.data)
        .enter()
        .append("path")
        .attr("class", "line");

    round
        .attr("d", function(d) {return that.line(d[that.coords])})
        .attr("stroke", function(d) {return that.color(d)})
        .attr("stroke-width", "1px")
        .attr("fill", "none")
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted);

    //this.updateVis();
};


/**
 * the drawing function - should use the D3 selection, enter, exit
 */
LineVis.prototype.updateVis = function(){
    var that = this;

    this.line = d3.line()
        // .interpolate("basis")
        .x(function(d) { return that.x(d.x); })
        .y(function(d) { return that.y(d.y); });

    this.x.domain(dataExt(allData, this.coords, "x"));
    this.y.domain(dataExt(allData, this.coords, "y"));

    var round = this.svg.select(".round").selectAll("path")   // change the line
        .data(this.data);
    round
        .enter()
        .append("path")
        .attr("class", "line");
    this.svg.select(".round").selectAll("path")
        .transition().duration(750)
        .attr("d", function(d) {return that.line(d[that.coords])})
        .attr("stroke", function(d) {return that.color(d)})
        .attr("stroke-width", "1px")
        .attr("fill", "none");

    round
        .exit().remove();

    this.svg.select(".round").selectAll("path")
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted);

    this.svg.select(".x.axis") // change the x axis
        .transition().duration(750)
        .call(this.xAxis);
    this.svg.select(".y.axis") // change the y axis
        .transition().duration(750)
        .call(this.yAxis);

};


LineVis.prototype.onChange = function (filtered_data, coordsType, extents){
    this.data = filtered_data;
    this.coords = coordsType;
    this.updateVis();
};


//..........................................................
//......................helpers.............................
//..........................................................

function dataExt(data, key1, key2) {
    var exts = data.map(function(d) {
        return d3.extent(d[key1].map(function(p) {
            return p[key2];
        }));
    });
    return d3.extent([].concat.apply([], exts));
}

function mouseovered(d) {
    d3.select(this).classed("lineActive", true);
    document.getElementById("areaText").innerHTML = d.area;
    document.getElementById("ratioText").innerHTML = d.ratio.toFixed(2);
    document.getElementById("maxDevText").innerHTML = d.maxDev.toFixed(2);
}

function mouseouted(d) {
    d3.select(this).classed("lineActive", false);
    document.getElementById("areaText").innerHTML = "";
    document.getElementById("ratioText").innerHTML = "";
    document.getElementById("maxDevText").innerHTML = "";
}