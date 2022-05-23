let palette = ['#9C258F','#FDC344', '#1BBDD4','#C75B48']
let data_list = [["performance_min","performance_median","performance_max"],
				 ["collaboration_min","collaboration_median", "collaboration_max"],
				 ["innovation_min","innovation_median","innovation_max"],
				 ["agility_min","agility_median", "agility_max"]];

let arrow_icons_prev = ["blue-prev.svg", "orange-prev.svg","yellow-prev.svg","purple-prev.svg"]	
let arrow_icons_next = ["yellow-next.svg","purple-next.svg", "blue-next.svg", "orange-next.svg"]

let generations = ["Boomer", "Genreation X", "Millennial"]

let category_description = ["Performance refers to the optimal level, both mental and physical, that a person is able to achieve when implementing a task.",
							"Collaboration refers to the attainment of a common goal through the effort of a combined body of people working together.",
							"Innovation refers to the generation of new ideas, the tenacity to bring the best ones to life and the wisdom to know how to enthuse others to support them.",
							"Agility refers to the capacity to read changing conditions in one's environment and the ability to rapidly adjust to them."]
let curCategoryIdx = 0;
let curTypeIdx = 1;
let dataType = ["Lowest score", "Median score", "Highest score"];
// A function that create / update the plot for a given letiable:
// set the dimensions and margins of the graph
let margin = {top: 20, right: 30, bottom: 20, left: 50},
    width = window.innerWidth*0.6- margin.left - margin.right,
    height = window.innerHeight*0.5 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// svg.selectAll("mydots")
// .data(generations)
// .enter()
// .append("circle")
// .attr("cx", function(d,i){ return width})
// .attr("cy", function(d,i){ return height-100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
// .attr("r", 7)
// .style("fill", function(d){ console.log(palette2[d]); return palette2[d]})

let x = d3.scaleBand()
.range([0, width])
.padding([0.2])

// console.log(x.bandwidth())

let xAxis = svg.append("g")
.attr('class', 'axis')
.attr("transform", "translate(0," + height + ")")

// Add Y axis
let y = d3.scaleLinear()
.range([ height, 0 ]);

let yAxis = svg.append("g")
.attr('class', 'axis')
// .call(d3.axisLeft(y));

let tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")

let mouseover = function(d) {
	tooltip.transition().duration(200)
	let pillar = d.attributes;

	let diff_boomer = Number.parseFloat(d["Millenial/Zoomer"] - d["Boomer"]).toFixed(2);
	let diff_genx = Number.parseFloat(d["Millenial/Zoomer"] - d["Gen X"]).toFixed(2);
	let text ="Millennial vs Boomer: " ;
	let text2 = "Millennial vs Gen X:  ";

	tooltip
		.html("<h4>" + pillar + "<span>" + dataType[curTypeIdx] + "</span>"+ "</h4>" +
			"<div>"+ text + "<p id='diff-boomer'>"+diff_boomer+"</p>"   +"</div>\n <div>"+ text2 + "<p id='diff-genx'>"+diff_genx+"</p>"   + "</div>\n")
		.style("opacity", 1)
		.attr("hidden", null)
	document.getElementById('diff-boomer').style.color = diff_boomer < 0 ? "#DC0000" : "#06dc00"
	document.getElementById('diff-genx').style.color = diff_genx < 0 ? "#DC0000" : "#06dc00"

	}
let mousemove = function(d) {
	console.log("Mouse Move")
	tooltip
	.style("left", (d3.event.pageX + 16) + "px")
	.style("top", (d3.event.pageY + 16) + "px")
}
let mouseleave = function(d) {
	console.log("Mouse Leave")
	tooltip.html("")
		.transition().duration(200)
		.attr("hidden", true)
		.style("opacity", 0)
	
	// d3.select(this)
	// 	.style("stroke", "none")
	// 	.style("opacity", 0.8)
}



function update(datatypeIndex) 
{
	curTypeIdx = datatypeIndex;
	let buttons = document.getElementsByClassName("typeButton")
	console.log(buttons)
	for (let i = 0; i < buttons.length; i++)
	{
		if(i == curTypeIdx)
			buttons[i].setAttribute("id", "activatedTypeButton")
		else
			buttons[i].removeAttribute("id")
	}


	let category = Math.abs(curCategoryIdx);
	// console.log('Category: '+ curCategoryIdx+", Type: "+datatypeIndex);
	let csvFile = "data/"+data_list[category][datatypeIndex]+".csv";
	let txt = data_list[Math.abs(category)][datatypeIndex].split("_")[0]
	document.getElementById("category_icon").src = "assets/"+txt+".svg"
	document.getElementById('title').innerText = txt
	document.getElementById('description').innerText = category_description[curCategoryIdx]
	d3.csv(csvFile, function(data) {
		// List of subgroups = header of the csv files = soil condition here
		var subgroups = data.columns.slice(1);
		// List of groups = species here = value of the first column called group -> I show them on the X axis
	   	var groups = d3.map(data, function(d){return(d.attributes)}).keys()

		//X Axis
		x.domain(groups)
		// xAxis.call(d3.axisBottom(x).tickSize(0));
		xAxis.transition().duration(1000).call(d3.axisBottom(x))

		//Y Axis
		y.domain([0, 100])
		yAxis.transition().duration(1000).call(d3.axisLeft(y));

	
		// Another scale for subgroup position?
		var xSubgroup = d3.scaleBand()
			.domain(subgroups)
			.range([0, x.bandwidth()])
			.padding([0.05])

		// color palette = one color per subgroup
		var color = d3.scaleOrdinal()
			.domain(subgroups)
			.range(palette)
			

		// variable u: map data to existing circle
		var barGroups = svg.selectAll("g.layer").data(data); 
		
		barGroups.enter().append("g").classed('layer', true).style('pointer-events', "bounding-box")
		.attr("transform", function(d) { return "translate(" + x(d.attributes) + ",0)"; })
		
		svg.selectAll("g.layer")
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseleave', mouseleave)

		barGroups.exit().remove(); 
		

		var bars = svg.selectAll("g.layer").selectAll("rect")
			.data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
		bars.enter()
			.append("rect").attr("width", x.bandwidth()/3 - 8)
			.transition()
			.duration(750)
			.attr("x", function(d) { return xSubgroup(d.key); })
			.attr("y", function(d) { return y(d.value); })
			.attr("height", function(d) { return height - y(d.value); })
			.attr("fill", function(d) { return color(d.key); })


		bars.transition().duration(750)
			.attr("y", function(d) { return y(d.value); })
			.attr("height", function(d) { return height - y(d.value); })

		bars.exit().remove();

		var texts = svg.selectAll("g.layer").selectAll("text")
		.data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
		
		texts.enter()
		.append("text")
		.transition().duration(750)
		.attr("class", "bar-text")
		.attr("fill", "#f2f2f2")
		.attr("text-anchor", "middle")
		.attr("x", function(d) { return xSubgroup(d.key)+(x.bandwidth()/3 - 8)/2; })
		.attr("y", function(d) { return y(d.value)-10; })
		.text(function(d){ return Number.parseFloat(d.value).toFixed(2)})

		texts.transition().duration(750)
		.attr("x", function(d) { return xSubgroup(d.key)+(x.bandwidth()/3 - 8)/2; })
			.attr("y", function(d) { return y(d.value)-10 ; })
			.text(function(d){ return Number.parseFloat(d.value).toFixed(2)})
		texts.exit().remove()

	})
}



function changeCategory (value)
{
	curCategoryIdx += value;
    if (curCategoryIdx >3)
		curCategoryIdx = 0
    if (curCategoryIdx < 0)
		curCategoryIdx = 3;
	// curCategoryIdx = Math.abs(curCategoryIdx);
	document.getElementById("prev").src="assets/" + arrow_icons_prev[Math.abs(curCategoryIdx)]
	document.getElementById("next").src="assets/" + arrow_icons_next[Math.abs(curCategoryIdx)]

	update(curTypeIdx);
}



changeCategory(0)

