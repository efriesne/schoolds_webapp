

var tau = 2 * Math.PI;

/*
parent = div to append to
y = y coord in div
label = characteristic slider is changing
xScale = scale for this slider
id = slider id
*/

function addSlider(parent, y, label, xScale, id) {
	var slider = parent.append("g")
		.attr("class", "slider")
		.attr("transform", "translate(" + 350 + "," + y + ")")

	slider.append("text")
		.attr("class", "slider-label")
		.text(label)
		.attr("text-anchor", "end")
		.attr("x", "-20")
		.attr("y", "4")
	slider.append("text")
		.attr("class", "slider-result")
		.attr("id", id)
		.attr("text-anchor", "start")
		.text("0")
		.attr("transform", "translate(" + (xScale.range()[1]+17) + "," + 7 + ")")
	var sliderTray = slider.append("line")
		.attr("class", "slider-tray")
		.attr("x1", xScale.range()[0])
		.attr("x2", xScale.range()[1])
	slider.append("line")
		.attr("class", "tray-inset")
		.attr("x1", xScale.range()[0])
		.attr("x2", xScale.range()[1])
	var sliderHandle = slider.append("circle")
		.attr("class", "handle")
		.attr("r", 10)
	sliderHandle.call(d3.drag()
	    .on("start", function() {
	      console.log("clicked");
	    })
	    .on("drag", function() {
	      d3.select(this).attr("cx", xScale(xScale.invert(d3.event.x)));
	      result = parseInt(xScale.invert(d3.event.x))
			d3.select(this.parentNode).select(".slider-result").text(result);
			console.log(result)
	    })
		.on("end", function() {
			result = parseInt(xScale.invert(d3.event.x))
			d3.select(this.parentNode).select(".slider-result").text(result);
			console.log(result)
		}))
}

function addSelect(parent, y, label, options, id) {
	var select = parent.append("g")
		.attr("class", "select")
		.attr("transform", "translate(" + 350 + "," + y + ")")
	select.append("text")
		.attr("class", "slider-label")
		.text(label)
		.attr("text-anchor", "end")
		.attr("x", "-20")
		.attr("y", "4")
	var result = select.append("text")
		.attr("class", "slider-result")
		.attr("id", id)
		.attr("text-anchor", "start")
		.text("")
		.attr("transform", "translate(" + 20 + "," + 7 + ")")
		.attr("stroke", "white")
	var bbox = select.node().getBBox()

	selector = d3.select('#sliders-wrapper').append("select")
		.attr("class", "select-selector")
		.on("change", function(d) {
			val = d3.select(this).property('value');
			d3.select(id).text(result);
		})
		.attr("transform", "translate(" + (-1*bbox.x) + "," + (-1*bbox.y) + ")")
	var options = selector
	  .selectAll('option')
		.data(options).enter()
		.append('option')
			.text(function (d) { return d; });
}
//slider arr element: [id, max, label, type of selection, select arr (optional)]
function addSliderGroup(parent, y, label, slider_arr) {
	var width = 250;
	container = parent.append("g")
		.attr("class", "slider-group")
		.attr("transform", "translate(" + 10 + "," + y + ")");
	container.append("text")
		.attr("transform", "translate(" + 10 + "," + 10 + ")")
		.text(label)
		.attr("class", "group-label")
	sliders = container.append("g")
		.attr("class", "slider-group")
		.attr("transform", "translate(" + 0 + "," + 50 + ")");
	for (var i = 0; i < slider_arr.length; i++) {
		var scale = d3.scaleLinear()
		    .domain([0, slider_arr[i][1]])
		    .range([0, width])
		    .clamp(true);
		if (slider_arr[i][3] == "slider") {	
			addSlider(sliders, (i)*36, slider_arr[i][2], scale,slider_arr[i][0])
		} else if (slider_arr[i][3] == "select") {
			addSelect(sliders, (i)*36, slider_arr[i][2], slider_arr[i][4],slider_arr[i][0])
		}
	}
}

var svg = d3.select(".sliders-svg")
var svg2 = d3.select(".success-svg")

addSliderGroup(svg, 50, "School Charateristics", [[7, 4500, "enrollment", "slider"], [56, 1, "type", "select", ["Charter", "Non-charter"]],
[57, 12, "level", "select", ["Primary", "Middle", "High", "Other"]]])
addSliderGroup(svg, 200, "Teachers", [[30, 50, "teacher-student ratio", "slider"]])
addSliderGroup(svg, 350, "Selected Population", [[11, 100, "first language not english %", "slider"],
	[13, 100,"english language learner %", "slider"], [15, 100, "students with disabilities %", "slider"],
	 [17, 100, "low income %", "slider"]])
addSliderGroup(svg, 600, "Race/Gender", [[38, 100, "male:female %", "slider"]])
addSliderGroup(svg, 700, "Incidents", [[49, 100, "# of incidents", "slider"]])

var arc = d3.arc()
    .innerRadius(180)
    .outerRadius(240)
    .startAngle(0);

successPred = svg2.select(".success-vis")
	.attr("transform", "translate(" + 700 + "," + 400 + ")");;

arc1 = successPred.append("path")
	.datum({endAngle: tau})
    .style("fill", "#ddd")
    .attr("d", arc);

arc2 = successPred.append("path")
.datum({endAngle: 0.127 * tau})
.style("fill", "green")
.attr("d", arc);

prediction = successPred.append("text")
	.text("0.0")
	.attr("class", "predict-label")
	.attr("text-anchor", "middle")
	.attr("transform", "translate(" + 0 + "," + 50 + ")");


var startColor = '#ff0000';
var endColor = '#00ff00';
colorScale = d3.scaleLinear().domain([0, 10]).range([startColor, endColor]);


function getSuccess() {

	fields = ['-fields']
    values = ['-vals']
	var results = d3.selectAll(".slider-result").each(function(d) {
		field = d3.select(this).attr("id")
		value = d3.select(this).text()
		if (value != "") {	
			fields.push(field)
			values.push(value)
		}
	})
	console.log(fields)
	console.log(values)

    $.get('/success', {fields: fields, values: values}, function(res){
        console.log("received success");
        console.log(res/10);
        $("#prediction").text(res)
        arc2.attr("d", function(d) {
        	d.endAngle = res/10 * tau;
        	return arc(d);
        }).style("fill", function(d) {
        	return colorScale(res)
        });
        prediction.text(res)
    });
}



