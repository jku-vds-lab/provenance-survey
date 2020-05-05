function create_panel(allScores){

  tooltipDict={
    size:'Small: <100 nodes  Medium: <1000 nodes Large: >1000 nodes',
    // type:'Small: <100 nodes  Medium: <1000 nodes Large: >1000 nodes',
    node_attr_size:'few attributes: <5  several attributes: >5',
    node_attr_type:'homogeneous: 1 type heterogeneous: >1 type',
    edge_attr_size:'few attributes: <3  several attributes: >3',
    edge_attr_type:'homogeneous: 1 type heterogeneous: >1 type',
    structure:'CLUSTER: a set of well connected nodes, such as a community in social networks. NETWORK: the entire network or a subset that is not limited to a specific structure'
  }

let groups = d3.select('#wizard_panel').selectAll('div').data(Object.keys(optionsObject));

let groupsEnter = groups.enter().append('div').attr('class','dataDiv');

//Add Header
let h4 = groupsEnter.append('h4');

h4.append('span').attr('id','header');
h4
.filter(d=>tooltipDict[d])
.append('span')
.attr('id','icon')
.append('i');

let switchEl = h4.append('span').attr('class','field is-pulled-right');

switchEl.append('input')
.attr('type','checkbox')
.attr('class','switch is-info is-small');

switchEl.append('label');

//Add options
groupsEnter.append('div').attr('class','tabs is-fullwidth is-toggle'); 

let ul = groupsEnter.select('.tabs')
.append('ul');

groups = groupsEnter.merge(groups);

//Set data dependent attributes

groups
.attr('class',d=>'dataDiv data_' + d);

groups.select('.switch')
.attr('id',d=>'switch_'+d);

groups.select('label')
.attr('for',d=>'switch_'+d);

groups.select('#header')
.text(d=>optionsObject[d].label);

groups.select('#icon')
.attr('class','icon tooltip is-tooltip-multiline')
.attr('data-tooltip',d=>tooltipDict[d]);

groups.select('i')
.attr('class','fas fa-question-circle has-text-grey');


let li = groups.select('ul').selectAll('li').data((d)=>optionsObject[d].options.map(
option=>{return {category:d,option}}));

let liEnter = li.enter().append('li');

liEnter.append('a').append('span');

li = liEnter.merge(li);

li.attr('class',d=> d.category +  ' ' + d.option);

li.select('span').text(d=>d.option);


li.on('click',function(d){
 
let tabGroup = d3.select((this.parentNode).parentNode);
let category = tabGroup.data()[0];

// console.log('clicked', d);
let isSelected = d3.select(this).classed('is-active');

if (category !== 'structure'){
  tabGroup.selectAll('li').classed('is-active',false);
}
d3.select(this).classed('is-active',!isSelected);

//if no elements are selected, set toggle to false;
selectedTabs = tabGroup.selectAll('.is-active');

d3.select('#switch_' + category)
.property('checked',selectedTabs.empty()? false : true);

compute_scores(allScores);


//highlight all mini panel buttons for active tabs. 
selectedTabs = d3.select('#wizard_panel').selectAll('.is-active').each(function(tab){
  let currentClass = d3.select(this).attr('class').replace('is-active','').trim();
  let miniButtons = d3.selectAll('.button').filter(function(b){
      return d3.select(this).attr('class').includes(currentClass);
   }).classed('is-focused',true);
})

});

d3.selectAll(".switch").on("change", function(d){

let tabGroup = d3.select(((this.parentNode).parentNode).parentNode).select('.tabs');
let category = tabGroup.data()[0];

d3.select(this).property('checked',false); //for now disable turning the toggle on;

tabGroup.selectAll('li')
.classed('is-active',false);

compute_scores(allScores);

//highlight all mini panel buttons for active tabs. 
selectedTabs = d3.select('#wizard_panel').selectAll('.is-active').each(function(tab){
  let currentClass = d3.select(this).attr('class').replace('is-active','').trim();
  let miniButtons = d3.selectAll('.button').filter(function(b){
      return d3.select(this).attr('class').includes(currentClass);
   }).classed('is-focused',true);
})

});

compute_scores(allScores);
}

function create_mini_panel(techniques,allScores){

  let score2class = {
    "1": "score-one",
    "2": "score-two",
    "3": "score-three",
    "0": "score-zero"
  };

  
  let cards = d3.selectAll('.techniqueCard').data(techniques.map(t=>t[0]));


let groups = cards.select('#mini_wizard_panel').selectAll('div').data(d=>Object.keys(optionsObject).map(k=>{return {'technique':d,'dimension':k}}));

let groupsEnter = groups.enter().append('div');

//Add Header
let h4 = groupsEnter.append('h6');

h4.append('span').attr('id','header');

groups = groupsEnter.merge(groups);

//Set data dependent attributes


groups.select('#header')
.text(d=>optionsObject[d.dimension].shortLabel ? optionsObject[d.dimension].shortLabel : optionsObject[d.dimension].label);


let li = groups.selectAll('a').data((d)=>optionsObject[d.dimension].options.map(
option=>{return {category:d.dimension,option,technique:d.technique}}));

let liEnter = li.enter().append('a');

liEnter.append('a').append('span');

li = liEnter.merge(li);

li.attr('class',d=>{
  let score = allScores[d.technique][d.category][d.option];
  return d.category +  ' ' + d.option + ' ' + score2class[score] + ' button tooltip';
})
.attr('data-tooltip',d=>d.option);


li.text(d=>{
  let score = allScores[d.technique][d.category][d.option];
  return score;
});
}

function compute_scores(allScores){

  d3.select('#recommendations').style('visibility','visible');

  //create a list of key/value pairs to use in the scores
  let activeOptions = d3.selectAll('.is-active').data(); 
  
  let num2strMap = {
    "1": "ones",
    "2": "twos",
    "3": "threes",
    "0": "zeros"
  };


  Object.keys(allScores).map(technique => {
    allScores[technique].totalScore = 0;
    allScores[technique].threes=[];
    allScores[technique].twos=[];
    allScores[technique].ones=[];
    allScores[technique].zeros=[];

    activeOptions.map(option=>{
      let score = allScores[technique][option.category][option.option];
      // console.log(technique,option.category,option.option,score);
      allScores[technique].totalScore = allScores[technique].totalScore + score;
      allScores[technique][num2strMap[score]].push([option.category,option.option]);
    });
     let score = activeOptions.length > 0 ? allScores[technique].totalScore / activeOptions.length : allScores[technique].totalScore;
     allScores[technique].averageScore = Math.round( score * 10) / 10
  });

  let scoreArray = Object.keys(allScores).map(key=>{
    return [key,allScores[key].averageScore]
  }).sort((a,b)=>{
    if (b[1] <a[1]){
      return -1
    }

    if (b[1] === a[1]){
      if (b[0] > a[0]){
        return -1
      } else {
        return 1
      }
    }
    if (b[1] >a[1]){
      return 1
    }
  })

  // console.log('allScores_computed',scoreArray)

  render_techniques(scoreArray,allScores);
}

function render_techniques(techniques,info) {

  let color = d3.scaleLinear().domain([0,1,2,3])
    .range(['#f3a685','#cccccc','#92c5de','#1773af']);

   let cards = d3.selectAll('.techniqueCard').data(techniques);

   cards.select('.rec').select('h4').select('.techniqueTitle').html(d=>'<a href="' + info[d[0]].baseUrl + info[d[0]].url + '">' + info[d[0]].title + '</a>');

   cards.select('.totalScore')
   .style('background-color',d=>{
    return color(d[1])})

   cards.select('.totalScore')
   .text(d=>d[1]);

  cards.select('img').property('src',d=>'/mvnv/assets/images/techniques/icons/' + info[d[0]].image);

  cards.select('.moreLink').html(d=>'<a href="' + info[d[0]].baseUrl + info[d[0]].url + '"> More... </a>');

   cards.select('.techniqueDescription').text(d=>info[d[0]].description)

   cards.select('.optimal').text(d=>info[d[0]].optimal)
   cards.select('.good').text(d=>info[d[0]].good)
   cards.select('.adequate').text(d=>info[d[0]].adequate)
   cards.select('.bad')
   .text(d=>info[d[0]].bad)

   //only show this for techniques that actually have a 0 score.
   cards.select('.scoreZero')
   .style('display',d=> info[d[0]].bad.length === 0 ?  'none' : 'block');
  
   create_mini_panel(techniques,info);


}


