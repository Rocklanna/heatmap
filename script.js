const req = new XMLHttpRequest();
const w = 1500;
const h = 500;
const padding = 80;
const gridsize = 5;
const legendWidth = 400;

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

req.open("GET", url,"true");
req.send();
req.onload = function(){
  
  var numMonth ={
  "0": "January",
  "1":"February",
  "2":"March",
  "3":"April",
  "4":"May",
  "5":"June",
  "6":"July",
  "7":"August",
  "8":"September",
  "9":"October",
  "10":"November",
  "11":"December"
}
 var legendColors =  [
      '#a50026',
      '#d73027',
      '#f46d43',
      '#fdae61',
      '#fee090',
      '#ffffbf',
      '#e0f3f8',
      '#abd9e9',
      '#74add1',
      '#4575b4',
      '#313695'
    ] 
  var data = JSON.parse(req.responseText);
 
 var baseTemp =  data["baseTemperature"];
 var dateInfo = data["monthlyVariance"];
  var parseTime = d3.timeParse("%B");
  
  dateInfo = dateInfo.map(item=>{
    return [item["year"],item["month"]-1,item["variance"]]
  });
  
 
  var dataX = dateInfo.map(item=>item[0]);
   var dataY = dateInfo.map(item=>numMonth[item[1]]);
    var domainX = dataX.filter((item,i,ar)=> 
   ar.indexOf(item)===i
  );
  var domainY = dataY.filter((item,i,ar)=> 
   ar.indexOf(item)===i
  );
   
    var tickX = domainX.filter((item)=>item %10 === 0 );
   var scaleX = d3.scaleBand()
                  .domain(domainX)
                  .range([padding,w-padding]);
  
     var scaleY = d3.scaleBand()
                  .domain(domainY)
                  .range([h-padding,padding]);
  
  var xAxis = d3.axisBottom(scaleX)
                 .tickValues(tickX);
  
  var yAxis = d3.axisLeft(scaleY);
  
  var svg = d3.select("#graph")
              .append("svg")
              .attr("width",w)
              .attr("height",h)
              .attr("id","svg")
  
  svg.append("g")
      .attr("id","x-axis")
   .attr("transform","translate(0,"+ (h-padding)+ ")")
      .call(xAxis);
  
 svg.append('text')
      .text('Years')
      .style('text-anchor', 'middle')
      .attr("transform","translate("+(w/2)+","+(h-20)+")");
  
  
  svg.append("g")
      .attr("id","y-axis")
      .attr("transform","translate("+padding+",0)")
      .call(yAxis);
  
   svg.append('text')
      .text('Months')
      .style('text-anchor', 'middle')
       .attr("transform","translate(" +(padding/3)+","+(padding*3.5)+")rotate(-90)");
  
    var TotalTemp = dateInfo.map(item=>baseTemp+item[2]);
 // var legendData = dateInfo.map(item=>item[2]);
  
      var minTemp =Math.min.apply(null, TotalTemp);
    var maxTemp = Math.max.apply(null, TotalTemp);
  
  var legendKeys = (function (min, max, count) {
          var array = [];
          var step = (max - min) / count;
          var base = min;
          for (var i = 1; i < count; i++) {
            array.push(base + i * step);
          }
          console.log(array);
          return array;
        })(minTemp, maxTemp, legendColors.length);
  
  var legendThreshold = d3.scaleThreshold()
                           .domain(legendKeys)
                           .range(legendColors.reverse());
  
    var legendThresholdX = d3.scaleBand()
                           .domain(TotalTemp)
                           .range(legendKeys);
     
  var legendX = d3.scaleLinear()
                   .domain([minTemp, maxTemp])
                   .range([0, legendWidth]);

    var legendXAxis = d3.axisBottom(legendX)
                         .tickSize(10, 0)
                         .tickValues(legendKeys)
                         .tickFormat(d3.format('.1f'));
 
  var gridSize = legendX(legendKeys[0]);
  var legend = svg.append("g")
                  .attr("id","legend")  
                  .attr("transform","translate("+(padding/2)+","+(h-25)+")")
                  .call(legendXAxis);
  
  var tooltip = d3.select("#main")
                  .append("div")
                  .attr("id","tooltip");
  
  var header = d3.select("#header")
                .append("div")
                .attr("id","title")
                .html("Monthly Global Land-Surface Temperature")
                .append("div")
                .attr("id","description")
                .html("1753 - 2015: base temperature 8.66℃");
  
  legend.selectAll("#legend")
        .data(legendKeys)
        .enter()
        .append("rect")
        .attr("x",(d,i)=>legendX(d))
        .attr("y",-20)
        .attr("width",gridSize)
        .attr("height","20")
        .style("fill",(d,i)=>legendThreshold(d))
        .style("stroke","black")

  
  svg.selectAll("rect")
      .data(dateInfo)
      .enter()
      .append("rect")
      .attr("class","cell")
      .datum(([x,y,z],i)=>[x,y,z,i])
      .attr("data-month",(d,i)=>d[1])
      .attr("data-year",(d,i)=>d[0])
      .attr("data-temp",(d,i)=>TotalTemp[i])
      .attr("x",(d,i)=>scaleX(d[0]))
      .attr("y",(d,i)=>scaleY(numMonth[d[1]]))
      .attr("width","10")
      .attr("height","28")
      .style("fill",(d,i)=>legendThreshold(TotalTemp[i]))
      .on("mouseover",function(event,d){
            tooltip.attr("data-year",d[0])
              .style("top",event.pageY+"px")
                   .style("left",event.pageX+"px")
                   .style("visibility","visible")
                   .html(d[0]+" - "+numMonth[d[1]]+"<br>"
                          +TotalTemp[d[3]].toFixed(1)+"&#8451"+"<br>"
                          +d[2].toFixed(1)+"&#8451")
  })
  .on("mouseout",function(){
    tooltip.style("visibility","hidden")
  })
    
  
   console.log("start");
  console.log(JSON.stringify(dateInfo));
   console.log(JSON.stringify(parseTime(domainY[1])));
  console.log(domainX);
  console.log(domainY);
  console.log(tickX);
   console.log(minTemp);
    console.log(maxTemp);
  console.log(legendKeys);
   console.log(TotalTemp);
   console.log( legendThreshold(TotalTemp[0]));
   console.log( legendThreshold(legendKeys[4]));
  console.log("end");
}