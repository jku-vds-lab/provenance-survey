const table = d3.select(".objecttable");

all_data = [];

d3.csv('../assets/data/table2-noCite.csv')
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
                        return d;
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
        col_name = $(this).siblings('span:first').html();

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
    // console.log(filtered_data);
    updateTable(filtered_data);
}

