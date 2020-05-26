

const ref_list = d3.select('#referenceList');
var all_ref_data = []
var all_table_data = [];

d3.csv('../../assets/data/table2-combCite.csv')
    .then((data) => { // wait until loading has finished, then ...
        all_table_data = data;
        update_references();  
    });

d3.json('../../assets/data/main_clean.json')
    .then((data) => {
        // console.log(data);
        all_ref_data = data;
        update_references();
    });

function update_references(){
    const category = $('title').html();
    // const cat_col = all_table_data.map(x => x[category]);
    const filtered_table = all_table_data.filter((d, idx) => d[category] > 0);
    const filtered_ids = filtered_table.map(x => x['Paper#Ref'].split('#')[1]);
    const filtered_refs = all_ref_data.filter((d, idx) => filtered_ids.includes(d['id']));
    updateRefList(filtered_refs);
}


function updateRefList(data) {
    // add a div for each item in the dataset
    var divs = ref_list.selectAll(".citation")
        .data(data.sort((a,b)=>{
            return parseInt(b.issued["date-parts"][0][0]) - parseInt(a.issued["date-parts"][0][0]); //sort by year descending
        }), d => {
            if (d === undefined) {
                return d;
            }
            return d.id;
        }) //...which column is the identifier
        .join(
            (enter) => {
                const div_enter = enter.append('div');
                div_enter.attr('class', 'citation');
                div_enter.attr('id', (d) => d.id);
                const p_enter = div_enter.append('p');

                p_enter.html((d) => {
                    var authors = "";
                    var first = true;
                    for (const i in d.author) {
                        if (d.author.hasOwnProperty(i)) {
                            const author = d.author[i];

                            if (!first) {
                                authors += ", "
                            } else {
                                first = false;
                            }
                            authors += author.family;
                            // if(author.given != undefined){ // 2 authors had "literal" instead of first and last name => changed it
                            authors += "&nbsp;";
                            authors += author.given.substr(0, 1);
                            // }
                            authors += ".";
                        }
                    }

                    var html = `${authors} (${d.issued["date-parts"][0][0]}).`;
                    return html;
                });

                const span_title_enter = p_enter.append("span");
                span_title_enter.attr('class', 'paper-title');
                span_title_enter.html((d) => ` <b>${d.title}</b> `);

                const em_enter = p_enter.append("em");
                em_enter.html((d) => d['container-title']);

                const span_doi_enter = p_enter.append("span");
                span_doi_enter.html((d) => {
                    var ret_str = ""
                    if (d.volume != undefined || d.issue != undefined || d.page != undefined) {
                        ret_str += ', ';
                    }
                    if (d.volume != undefined) {
                        ret_str += `${d.volume} `;
                    }
                    if (d.issue != undefined) {
                        ret_str += `(${d.issue})`;
                    }
                    if ((d.volume != undefined || d.issue != undefined) && d.page != undefined) {
                        ret_str += `: ${d.page}`;
                    }else{
                        ret_str += d.page;
                    }
                    if (d.volume != undefined || d.issue != undefined || d.page != undefined) {
                        ret_str += '.';
                    }
                    return ret_str;
                });
                const a_doi_enter = span_doi_enter.append('a');
                a_doi_enter.attr('href', (d) => d.URL);
                a_doi_enter.attr('target', '_blank');
                a_doi_enter.html((d) => ` doi:${d.DOI}`);

                // <em>Computer Graphics Forum</em>,
                //     <span class="paper-citation">
                //         38 (3):41-52.
                //         <a href="http://dx.doi.org/10.1111/cgf.13670" target="_blank">doi:10.1111/cgf.13670</a>.
                //     </span>

                return div_enter;
            },
            (update) => update,
            (exit) => {
                return exit.transition().remove();//duration(500).attr("height", 0).remove();
            }
        );
}