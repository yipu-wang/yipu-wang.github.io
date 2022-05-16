var curDemoIndex = 0;

var demograhpics = ["gender","immigrant status","position","industry group"]
// set the dimensions and margins of the graph
let palettes = [["#81D8D0", "#F50A98"],
                ["#A3BFEC", "#F39E3D"],
                ["#2950DC", "#E77849"],
                ["#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2"]];
var d_margin = {top: 10, right: 30, bottom: 30, left: 60},
    d_width = 720 - margin.left - margin.right,
    d_height = 600 - margin.top - margin.bottom;   

var tooltip2 = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")

let debug_mouseover = function(d) {
    tooltip2.html("<div> (" + d3.mouse(this)[0] +", " + d3.mouse(this)[1] + ") </div>")
    .style("opacity", 1)

}
let debug_mousemove = function(d) {
    tooltip2
    .style("left", (d3.event.pageX + 16) + "px")
    .style("top", (d3.event.pageY + 16) + "px")
}
let debug_mouseleave = function(d) {
    tooltip2
    .transition().duration(200)
    .style("opacity", 0)
}



// append the svg2 object to the body of the page
var svg2 = d3.select("#demography-graph")
  .append("svg")
    .attr("width", d_width + d_margin.left + d_margin.right)
    .attr("height", d_height + d_margin.top + d_margin.bottom)
    .style('pointer-events', "bounding-box")
  .append("g")
    .attr("transform",
          "translate(" + d_margin.left + "," + d_margin.top + ")");

// Debug Mouse Position
// svg2
// .on('mouseover', debug_mouseover)
// .on('mousemove', debug_mousemove)
// .on('mouseleave', debug_mouseleave)

var x_gender = d3.scaleOrdinal()
                .domain([0, 1])
                .range([50, 340])       

var x_positions = [d3.scaleOrdinal()
        .domain([0, 1])
        .range([100, 300]),
    d3.scaleOrdinal()
        .domain([0, 1])
        .range([75, 350]),
    d3.scaleOrdinal()
        .domain([0, 1])
        .range([100, 300]),
    d3.scaleOrdinal()
        .domain([0,1,2,3,4,5,6,7,8,9])
        .range([20, 600, 25, 100, 250, 350, 300, 600, 650, 500])
]

var y_positions = [d3.scaleOrdinal()
        .domain([0, 1])
        .range([250, 375]),
        d3.scaleOrdinal()
        .domain([0, 1])
        .range([425, 225]),
        d3.scaleOrdinal()
        .domain([0, 1])
        .range([250, 400]),
        d3.scaleOrdinal()
        .domain([0,1,2,3,4,5,6,7,8,9])
        .range([120, 530, 300, 500, 20, 200, 430, 400, 250, 70])
]

var captions_x = [d3.scaleOrdinal()
    .domain([0, 1])
    .range([218, 438]),
    d3.scaleOrdinal()
    .domain([0, 1])
    .range([120, 415]),
    d3.scaleOrdinal()
    .domain([0, 1])
    .range([238, 480]),
    d3.scaleOrdinal()
    .domain([0,1,2,3,4,5,6,7,8,9])
    .range([0, 600, 0, 80, 250, 350, 300, 580, 660, 500])
]
var captions_y = [d3.scaleOrdinal()
    .domain([0, 1])
    .range([150, 295]),
    d3.scaleOrdinal()
    .domain([0, 1])
    .range([360, 145]),
    d3.scaleOrdinal()
    .domain([0, 1])
    .range([160, 460]),
    d3.scaleOrdinal()
    .domain([0,1,2,3,4,5,6,7,8,9])
    .range([130, 570, 330, 540, 20, 220, 465, 425, 270, 80])
]

function showDemography(inIndex)
{   
    let demoIndex = Math.abs(inIndex)

    svg2.selectAll("*").remove();
	let cate = demograhpics[demoIndex]
	let filename = "data/demography/" + cate + ".csv"

	d3.csv(filename, function(percentages) {
        let data = [];
        let idx = 0;
        let match = {};
        for(let i = 0; i < percentages.length; i++){
            let num = Number.parseInt(percentages[i].percentage);
            for (let j = 0; j < num; j++){
                match[percentages[i].category] = i;
                data.push({"index": idx, "group":i})
                idx+= 1;
            }
        }
        var node = svg2.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("cx", d_width/2)
            .attr("cy", d_height / 2)
            .style("fill", function(d){return palettes[demoIndex][d.group]})
            .style("fill-opacity", 1)
            // .attr("stroke", "#69a2b2")
            // .style("stroke-width", 1)

        // Features of the forces applied to the nodes:
        var simulation = d3.forceSimulation()
        .force("x", d3.forceX().strength(0.1).x( function(d){return x_positions[demoIndex](d.group) } ))
        .force("y", d3.forceY().strength(0.1).y( function(d){return y_positions[demoIndex](d.group)} ))
        .force("center", d3.forceCenter().x(d_width / 2).y(d_height / 2)) // Attraction to the center of the svg2 area
        .force("charge", d3.forceManyBody().strength(-5 )) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(0).radius(10).iterations(1)) // Force that avoids circle overlapping

        // Apply these forces to the nodes and update their positions.
        // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
        simulation
        .nodes(data)
        .on("tick", function(d){
        node
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
        });

        var texts = svg2.selectAll("g").selectAll("text")
		.data(percentages, function(d) { return d; })
		
		texts.enter()
		.append("text")
		.transition().duration(450)
		.attr("class", "demo-caption")
		.attr("fill", "#f2f2f2")
		.attr("text-anchor", "middle")
		.attr("x", function(d) { return captions_x[demoIndex](match[d.category]); })
		.attr("y", function(d) { return captions_y[demoIndex](match[d.category]); })
		.text(function(d){return d.category + ": " + d.percentage + "%";/*return Number.parseFloat(d.value).toFixed(2)*/})
        .style("font-family","ProximaNova")
        .style("font-size","16px")
        .style("text-transform", "capitalize")

		texts.transition().duration(450)
		.attr("x", function(d) { return xSubgroup(d.key)+(x.bandwidth()/3 - 8)/2; })
        .attr("y", function(d) { return y(d.value)-10 ; })
        .text(function(d){ return Number.parseFloat(d.value).toFixed(2)})

        texts.exit().remove();
    })
    
}

function changeDemoData (value)
{
	curDemoIndex += value;
    if (curDemoIndex >3)
        curDemoIndex = 0
    if (curDemoIndex < 0)
        curDemoIndex = 3;
	// curDemoIndex %= 4;
	showDemography(curDemoIndex);
}



showDemography(curDemoIndex)