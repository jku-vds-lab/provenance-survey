    function technique_scores(scores,categories) {
        let data = [];

    // let scores = JSON.parse(('{{page.scores}}'.replace(/=>/g, ':')));

    let panelWidth = d3.select('#technique_scores').style('width').replace('px', '');
    let panelHeight = d3.select('#technique_scores').style('height').replace('px', '');

    let tasks = [];
    Object.keys(categories).map((category_label)=>{
    
      let categoryObject = {
        type:'category',
        label:category_label,
        order:categories[category_label].order,
        multiLine:category_label.trim().indexOf(' ') != -1,
      }
      
      tasks.push(categoryObject);

      let numChildren = 0;
      //find relevant fields for that category in the scores object;
      categories[category_label].keys.map((key)=>{   
        Object.keys(scores[key]).map(task=>{
            tasks.push({type:'task',category:category_label, label:task,value:Number(scores[key][task])})
            numChildren = numChildren +1;
        })
      })

      categoryObject.numChildren = numChildren;

     });

    let groups = d3.select("#technique_scores")
      .selectAll('g')
      .data(tasks);

      console.log('group size', groups.size())

    let groupsEnter = groups.enter().append('g')
    groups = groupsEnter.merge(groups);

    groups.filter(d=>d.type === 'task')
    .append('rect').attr('class', 'scoreRect')

    groups.filter(d=>d.type === 'task')
    .append('text').text(d=>d.value)
    .attr('class','scoreText')
    
    let rectSize = d3.select('.scoreRect').style('width').replace('px', '') ;

    let yScale = d3.scaleLinear().domain([0, tasks.length]).range([0, panelHeight])

    groups
      .attr('transform', (d, i) => 'translate(0,' + yScale(i) + ')')
 
    groups.select('.scoreRect')
       .attr('y',-rectSize/2)
      .attr('class',function(d) {return d3.select(this).attr('class') + ' ' + 'score_' + d.value});
 
    groups.filter(d=>!d.multiLine) //select single word labels
      .append('text')
      .text(d=>d.label)

    let multiLine = groups.filter(d=>d.multiLine) //select multiword labels
      
      multiLine.append('text')
      .text(d=>d.label.split(' ')[0])
      .classed('first',true)

      multiLine.append('text')
      .text(d=>d.label.split(' ')[1])

      groups.selectAll('text')
      .attr('class',function(d) {
        let className;
        if (d3.select(this).classed('scoreText')) {
          className =  'scoreText';
        } else {
          className =  d3.select(this).attr('class') ? d3.select(this).attr('class') + ' ' + d.type : d.type
        }
        return className;
      });
        

    d3.selectAll('.task,.scoreText')
    .attr('dominant-baseline','middle')
    .attr('x', function(d){return d3.select(this).classed('task') ? rectSize *2 : 15});

    d3.selectAll('.scoreText')
    .attr('text-anchor','middle')
    .style('fill',d=>d.value < 3 ?  '#4a4a4a' : 'white')

    groups.selectAll('.category')
    .attr('transform','rotate(90,0,0)')
    .attr('dominant-baseline','baseline')
    .attr('text-anchor','middle')
    .attr('x', (d)=>{return d.numChildren*rectSize/2 + Number(rectSize)})
    .attr('y', function(d){return d3.select(this).classed('first') ? -200 : -180})
    }