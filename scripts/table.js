const table = d3.select(".objecttable");

all_data = [];

d3.csv('../assets/data/header.csv')
    .then((data) => {
        tr = table.select(".sub-categories");
        tr.selectAll("th").data(data)
            .join(
                (enter) => {
                    const th_enter = enter.append('th');
                    th_enter.html((d, idx) => {
                        // <th scope="col" class="rotate-45"><div><label><span><input value="1" class="cbFilter" type="checkbox"><img src="../assets/images/techniques/color_icons/adaptivesystems_c.png" height="20">Adaptive Systems</span></label></div></th>
                        return `<div><span>${d.col_name}</span></div><p style="width:20px"><label><img src="../assets/images/techniques/color_icons/${d.img_src}" height="20"><input value="${idx+1}" class="cbFilter" type="checkbox"> <input type="hidden" class="col_name" value="${d.col_name}"></label></p>`
                    });
                    th_enter.attr("class", (d,i) => `rotate-45 ${d.class}`);
                    th_enter.attr("scope", "col");
                    return th_enter;
                }
            )

        // -----filter stuff-----
        $('.cbFilter').click(update_filter_mask);
    });

d3.csv('../assets/data/table2-combCite.csv')
    .then((data) => { // wait until loading has finished, then ...
        // console.log(data);
        all_data = data;
        update_filter_mask();
        // updateTable(data);        
    });

function updateTable(data) {

    // ...inserted this due to some random bug, which always shows the first item of the dataset instead of the first item of the filtered dataset...
    var rows_temp = table.select("tbody")
    .selectAll("tr")
    .data([], d => {
        return d;
    })
    .join(
    (enter) => enter,
    (update) => update,
    (exit) => {
        return exit.remove();//transition().duration(500).attr("height", 0).remove();
    }
    );
    //...end of bugfix...

    // add a table row for each item in the dataset
    var rows = table.select("tbody")
        .selectAll("tr")
        .data(data, d => {
            return d;
        }) //...which column is the identifier
        .join(
        (enter) => {
            const tr_enter = enter.append('tr');
            return tr_enter;
        },
        (update) => update,
        (exit) => {
            return exit.transition().remove();//duration(500).attr("height", 0).remove();
        }
        );


    // add a table cell for each property (i.e., column) in an item
    var td = rows.selectAll("td")
        .data((d) => Object.values(d)) // `Object.values(d)` returns all property values of `d` as array
        .join(
        (enter) => {
            td_enter = enter.append("td")
            td_enter.html((d) => {
                // console.log(d);
                switch (d) {
                    case '0':
                        return `<img height=15px src='../assets/images/ReferenceTable/no.png' alt='no'/>`;
                    case '1':
                        return `<img height=15px src='../assets/images/ReferenceTable/yes1.png' alt='yes'/>`;
                    case '2':
                        return `<img height=15px src='../assets/images/ReferenceTable/yes2.png' alt='yes'/>`;
                    case '3':
                        return `<img height=15px src='../assets/images/ReferenceTable/yes3.png' alt='yes'/>`;
                    default:
                        return `<a class='literature_col' href='#${d.split('#')[1]}'>${d.split('#')[0]}</a>`;
                }
                return td_enter;
            }
            )

        });
}

// -----filter stuff-----
$('.cbFilter').click(update_filter_mask);

function update_filter_mask() {
    // console.log('-----filter--------');
    filtered = new Array(all_data.length);
    filtered.fill(true);

    $.each($('.cbFilter:checked'), function () {
        // col_name = $(this).siblings('span:first text').html();
        // col_name = $(this).siblings('text').html();
        col_name = $(this).siblings('.col_name')[0].value;

        for (var idx = 0; idx < all_data.length; idx++) {
            row = all_data[idx];
            value = row[col_name];
            intVal = parseInt(value);
            if (Number.isNaN(intVal) || intVal <= 0) {
                filtered[idx] = false;
            }
        }
    });

    filtered_data = all_data.filter((d, idx) => filtered[idx]);
    updateTable(filtered_data);

    filtered_refs = all_ref_data.filter((d, idx) => filtered[idx]);
    updateRefList(filtered_refs);
}

// --------References-------

// #referenceList

const ref_list = d3.select('#referenceList');
all_ref_data = []

d3.json('../assets/data/main_clean.json')
    .then((data) => {
        // console.log(data);
        all_ref_data = data;
        update_filter_mask();
    });


function updateRefList(data){
    // add a div for each item in the dataset
    var divs = ref_list.selectAll(".citation")
        .data(data, d => {
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

                        if(!first){
                            authors += ", "
                        }else{
                            first = false;
                        }
                        authors += author.family;
                        // if(author.given != undefined){ // 2 authors had "literal" instead of first and last name => changed it
                        authors += "&nbsp;";
                        authors += author.given.substr(0,1);
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
                if(d.volume != undefined || d.issue != undefined || d.page != undefined){
                    ret_str += ', ';
                }
                if(d.volume != undefined){
                    ret_str += `${d.volume} `;
                }
                if(d.issue != undefined){
                    ret_str += `(${d.issue})`;
                }
                if((d.volume != undefined || d.issue != undefined) && d.page != undefined){
                    ret_str += `: ${d.page}`
                }else{
                    ret_str += d.page;
                }
                if(d.volume != undefined || d.issue != undefined || d.page != undefined){
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