cats = ["WHY", "HOW", "WHAT"];

learnMoreDiv = d3.select('#learnMoreDiv');
learnMoreDiv.selectAll('div').data(cats)
    .join(
        (enter) => {
            const div_enter = enter.append('div');
            div_enter.html((d) => {
                return `<div class='cat'><h1><a href='techniques/index.html'>${d}</h1></a></div><div id='${d}div' class='subcat'></div>`;
            });
            div_enter.attr("class",  (d)=>{
                return `tile cat${d}`;
            });
        }
    );

$('#learnMoreDiv .cat').click(function(){
    const href = $(this).find('a').attr('href');
    window.location.href = href;
});

cats.forEach(function(cat) {
    d3.csv(`assets/data/${cat}.csv`)
        .then((data) => {

            catDiv = d3.select(`#${cat}div`);
            catDiv.selectAll('p').data(data)
                .join(
                    (enter) => {
                        const p_enter = enter.append('p');
                        p_enter.html((d) => {
                            return `<img src="assets/images/techniques/color_icons/${d.img_src}"> <a href="techniques/${d.ref}/index.html"> ${d.col_name}</a>`;
                        });
                    }
                );

        });

}, this);
