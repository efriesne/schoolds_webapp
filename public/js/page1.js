/////////////////////////////////////
// Some code copied from d3 project//
/////////////////////////////////////

// zooming courtesy of:
// https://bl.ocks.org/mbostock/db6b4335bf1662b413e7968910104f0f

// csv inner join courtesy of:
// http://stackoverflow.com/questions/17500312/is-there-some-way-i-can-join-the-contents-of-two-javascript-arrays-much-like-i/17500836#17500836

$( document ).ready(function() {

  getMapData()
     
});

function getMapData() {

  $.get('/mapData.json', function(res){
        loadMap(res);
    });
}


function loadMap(data) {

  // Chart dimensions
    var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5};
    var width = 960 - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var startColor = '#ff0000';
    var endColor = '#00ff00';

    // Various scales
    var xScale = d3.scaleLinear().domain([-73514, -69988]).range([0, width]),
        yScale = d3.scaleLinear().domain([41244, 42871]).range([height, 0]),
        colorScale = d3.scaleLinear().domain([0, 10]).range([startColor, endColor]),
        colorScale2 = d3.scaleOrdinal([0,1]),
        radiusScale = d3.scaleLinear().domain([0, 5000]).range([3, 40]);

    // The x & y axes
    var xAxis = d3.axisBottom(xScale),
        yAxis = d3.axisLeft(yScale);

    var level = d3.select("#level span"),
        town = d3.select("#town span"),
        charter_stat = d3.select("#charter_stat span")
        school_name = d3.select("#school_name span");


        data = data.filter(function(d) {
          // we're only using one year for now
          return d.year == 2013;
        })

        data.sort(order);


        var svg = d3.select("#chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + 0 + ")");
            
        var dot = svg.append("g")
            .attr("class", "dots")
          .selectAll("class", "dot")
            .data(data)
          .enter()
            .append("circle")
            .attr("class", "dot")
            .call(position)
            .attr("fill", function(d) {
             // return d3.schemeCategory10[colorScale(color(d))];
             return colorScale(color(d));
            })
            .sort(order);

        var zoom = d3.zoom()
          .scaleExtent([1, 40])
          .translateExtent([[-100, -100], [width + 90, height + 100]])
          .on("zoom", zoomed);

        var view = svg.append("rect")
          .attr("class", "view")
          .attr("x", 0.5)
          .attr("y", 0.5)
          .attr("width", width - 1)
          .attr("height", height - 1)
          .attr("visibility", "hidden");

        var gX = svg.append("g")
          .attr("class", "axis axis--x")
          .call(xAxis)
          .attr("visibility", "hidden");

        var gY = svg.append("g")
          .attr("class", "axis axis--y")
          .call(yAxis)
          .attr("visibility", "hidden");

        d3.select("#success")
            .on("click", function(d,i) {
                dot.data(data)
                  .attr("fill", function(d) {
                    return colorScale(color(d));
                  })
            })
        d3.select("#charter")
            .on("click", function(d,i) {
                dot.data(data)
                  .attr("fill", function(d) {
                    return d3.schemeCategory10[colorScale2(d.charter)];
                  })
            })
        d3.select("#math")
            .on("click", function(d,i) {
                dot.data(data)
                  .attr("fill", function(d) {
                    return colorScale(d.math_success);
                  })
            })
        d3.select("#english")
            .on("click", function(d,i) {
                dot.attr("fill", function(d) {
                    return colorScale(d.ela_success);
                  })
            })

        // Add a title.


        dot.append("title")
          .text(function(d) {
            return d.name;
          })

        dot.on("mouseover", function(d) {
          level.text(d.level)
          town.text(d.town)
          charter_stat.text(function(){
            if (d.charter == 0){
              return "No";
            }else{
              return "Yes";
            }
          })
          school_name.text(d.school)
        })

        dot.on("click", function(d){
          d.school_id = d.school_id;
          getNeighbors(d);
          getCharacteristics(d);

        })

        function zoomed() {
          svg.attr("transform", d3.event.transform);
          xAxis.scale(d3.event.transform.rescaleX(xScale));
          yAxis.scale(d3.event.transform.rescaleY(yScale));
          svg.selectAll('.dot').each( function(d) {
            d3.select(this).attr('r', radiusScale(d.total) / d3.event.transform.k);
          });
          svg.selectAll('.dot').style('stroke-width', 2 / d3.event.transform.k);
        }

        function x(d) {
          // Return school's longitude
          return d.long*1000;
        }
        function y(d) {
            // Return school's latitude
            return d.lat*1000;
        }
        function radius(d) {
            // nothing for now
            return d.total;
        }
        function color(d) {
            // Return school's charter/noncharter status
            return d.success;
        }
        function key(d) {
            // Return school's name
            return d.school;
        }

        svg.call(zoom);

        function position(dot) {
          dot.attr("cx", function(d) {
            return xScale(x(d)); })
              .attr("cy", function(d) { return yScale(y(d)); })
              .attr("r", function(d) { return radiusScale(radius(d)); });
        }

        function order(a, b) {
          return b.total - a.total;
        }
}


function getNeighbors(school) {

  var school_id = +school.school_id;
  var year = +school.year;
  getNeighborsRequest(school_id, year);

}

function showNeighbors(results, school_id) {

  var data = results.slice(0,11);

  console.log(data);
  console.log(school_id);

  var width = 800,
  barHeight = 20;

  var x = d3.scaleLinear()
      .range([0, 450]);

  //clear the previous graph
  var chart_selector = $(".graph");
  chart_selector.empty();

  var chart = d3.select(".graph")
      .attr("width", width);
  
  data.forEach(function(d){
    d.school_id = +d.school_id;
    d.success = +d.success;
    d.year = +d.year;
    d.name = d.school;
  });

  x.domain([0, 10]);

  data.sort(function (a, b) {
      return b.success - a.success;
  });

  chart.attr("height", barHeight * data.length);

  var bar = chart.selectAll("g")
      .data(data)
  .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

  bar.append("text")
      .attr("x", 280)
      .attr("y", barHeight / 2)
      .attr("text-anchor", "end")
      .attr("dy", ".35em")
      .text(function(d) { 
          return d.name + "  "});
      
  bar.append("rect")
      .attr("x", 285)
      .attr("width", function(d) { 
          return x(d.success); })
      .attr("height", barHeight - 2)
      .attr("fill", function(d){ 
          if (d.school_id == school_id){
            return "palegreen";
          } 
          else{ 
            return "darkslategray";}})

  bar.append("text")
      .attr("x", function(d) { return x(d.success) + 320})
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(function(d) { 
          return d.success.toFixed(3); });

  bar.on("click", function(d){
      getCharacteristics(d);
    })
}

function getNeighborsRequest(school_id, year) {

  $.get('/neighbors.json', { id: school_id, y: year }, function(res){
        getNeighborsInfoRequest(res, school_id);
    });
}

function getNeighborsInfoRequest(res, school_id) {
  console.log(res);

  $.get('/neighbors_info.json', res[0], function(res){
        showNeighbors(res, school_id);
    });
}

function getCharacteristics(school) {

  var query = { id: school.school_id, y: school.year };
  console.log(query); 

  $.get('/school_chars.json', query, function(res){
      if(res.length != 0) {
        formatData(res);
      }else {
        var title = $("#chars_title");
        title.text("Sorry! Data missing for that school. Please select another one.");
        var chars_selector = $(".chars");
        chars_selector.empty();
      }
  })

}

function formatData(res) {

    res = res[0];
    console.log("Raw characteristics!");
    console.log(res);

    var school_name = res.school;

    var race = [{val: res.white, label: "White"}, {val: res.native, label: "Native"}, {val: res.african_american, label: "Black"}, {val: res.asian, label: "Asian"}, {val: res.hispanic, label: "Hispanic"}];
    var gender = [{val: res.male, label: "Male"}, {val: res.female, label: "Female"}];
    var language = [{val: res.ELL_per, label: "ELL"}, {val: 100-res.ELL_per, label: "Non-ELL"}];
    var disabilities = [{val: res.disabilities_per, label: "Disabilities"}, {val: 100-res.disabilities_per, label: "No Disabilities"}];
    var income = [{val: res.low_inc_per, label: "Low Income"}, {val: 100-res.low_inc_per, label: "Non Low-Income"}];

    var data = [race, gender, language, disabilities, income];

    showCharacteristics(school_name, data);
}

function showCharacteristics(school_name, data) {
  console.log("characteristics!");
  console.log(data);

  var labels = ["Race", "Gender", "Language", "Disability Status", "Income"];

  var chars_selector = $(".chars");
  chars_selector.empty();

  var title = $("#chars_title");
  title.text("School Characteristics: " + school_name);

  var m = 10,
    r = 60,
    color = d3.scaleOrdinal(d3.schemeCategory20);

  var chars = d3.select(".chars").attr("width", 750).attr("height", 300);
    

  var svg = chars.selectAll("svg")
    .data(data)
  .enter().append("svg")
    .attr("width", (r + m) * 2)
    .attr("height", (r + m) * 2 + 40)
    .attr("x", function(d, i) {
        return i*135 + 30;
    })
    .attr("y", 30);

  var pies = svg.append("g")
    .attr("transform", "translate(" + (r + m) + "," + (r + m) + ")")
    .attr("x", function(d, i) {
        return i*135 + 30;
    })
    .attr("y", 150)
    .attr("margin-top", 10);


  var arc = pies.selectAll("path")
    .data(d3.pie().value(function(d) { 
        return d.val}))
  .enter().append("path")
    .attr("d", d3.arc()
        .innerRadius(r / 2)
        .outerRadius(r))
    .style("fill", function(d, i) { 
      return color(i); });

  var texts = pies.append("text")
    .attr("font-size", 20)
    .attr("text-anchor", "start")
    .attr("y", 80)
    .attr("x", -40)
    .text(function(d, i) {
      return labels[i];
    });


  arc.append("title")
    .text(function(d) {
      var percent = d.data.val.toFixed(2).toString();
      var label = d.data.label + ": " + percent + "%";
      return label;
    })

  //var footer = $("#footer");
  //footer.text("Hover over the charts to see more information.");

}





