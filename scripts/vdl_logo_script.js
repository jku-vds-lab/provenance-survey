svgString().then(logo => {
     d3.select("#svg").html(logo);
     run();
  });
  
  function run() {
    let leftSource = d3.select('.left-source');
    let midSource = d3.select('.mid-source');
    let rightSource = d3.select('.right-source');
  
    let loop;
  
    let staticBubbles = d3.selectAll('.static-circles');
  
    // setTimeout(() => {
    //   d3.selectAll('*').transition();
    //   clearInterval(loop);
    // }, 5000)
  
    d3.select('svg').on('mouseover', () => {
      animateBubble(...addBubble(leftSource), 'left');
      animateBubble(...addBubble(midSource), 'mid');
      animateBubble(...addBubble(rightSource), 'right');
      loop = setInterval(() => {
        animateBubble(...addBubble(leftSource), 'left');
        animateBubble(...addBubble(midSource), 'mid');
        animateBubble(...addBubble(rightSource), 'right');
      }, 100);
      staticBubbles.transition().duration(8000).attr('transform', `translate(0, -100)`).style('opacity', 0);
    }).on('mouseout', () => {
      clearInterval(loop);
      staticBubbles.transition().duration(0).attr('transform', `translate(0, 50)`);
      staticBubbles.transition().duration(8000).attr('transform', `translate(0, 0)`).style('opacity', 1);
    });
  
    function addBubble(source) {
      let radius = getRandomRadius();
      let xShift = shiftRandom(radius);
      return [source.append('circle').classed("bubble", true).attr('r', radius).attr('transform', `translate(${xShift}, 0)`), xShift];
    }
  
    function getRandomRadius() {
      return randomFloatInRange(0.5, 2)
    }
  
    function shiftRandom(radius) {
      let a = randomFloatInRange(-5, 5);
      if (Math.abs(a) + radius > 5) {
        if (a < 0) a = a + radius;
        else a = a - radius;
      }
      return a;
    }
  
    function animateBubble(bubble, xShift, position) {
      let points = getPoints(xShift, position);
      let path = getPath(points);
      bubble.transition().duration(sToMs(getRandomTime())).attrTween('transform', translateAlongPath(path.node())).remove();
      path.remove();
    }
  
    function getPath(points) {
      return d3.select('svg').append('path').attr('class', `random-path `).datum(points).attr('d', d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveMonotoneX))
    }
  
    function getRandomTime() {
      return randomFloatInRange(7, 9)
    }
  
    function sToMs(s) {
      return s * 1000;
    }
  
    function translateAlongPath(path) {
      let l = path.getTotalLength();
      return function (d, i, a) {
        return function (t) {
          let p = path.getPointAtLength(t * l);
          return `translate(${p.x}, ${p.y})`;
        }
      }
    }
  
    function getPoints(xShift, position = "mid") {
      let points = [
        [xShift, 0],
        [xShift, -20]
      ];
  
      if (position === 'left') {
        xShift = xShift + 13;
        points.push([xShift - 11, -22]);
        points.push([xShift - 6, -28]);
        points.push([xShift - 5, -30]);
        points.push([xShift - 1, -35]);
      } else if (position === 'right') {
        xShift = xShift - 13;
        points.push([xShift + 11, -25]);
        points.push([xShift + 6, -30]);
        points.push([xShift + 1, -36]);
      }
  
      points.push(...[
        [xShift, -50], //Bottleneck
        [xShift, -90],
      ]);
      return points;
    }
  
    function randomFloatInRange(min, max) {
      return Math.random() * (max - min) + min;
    }
  
    function randomIntInRange(min, max) {
      return Math.ceil(randomFloatInRange(min, max));
    }
  }
  
  async function svgString() {
    let path = '/mvnv/assets/images/logos/animated_logo_template.svg';
    return await d3.text(path)
    // return await d3.text('/assets/images/logos/test.svg')
    // return await d3.text('/assets/images/mvn_taxonomy.svg')
    }

    async function typologySVG() {
      let path = '/mvnv/assets/images/typology.svg';
      return await d3.text(path)
      }