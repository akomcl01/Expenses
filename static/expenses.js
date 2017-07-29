"use strict"
class Expense {
    constructor(date, store, category, item, amount, id) {
        this.date = date;
        this.store = store;
        this.category = category;
        this.item = item;
        this.amount = parseFloat(amount);
        if (id !== undefined) {
            this.id = id;
        }
    }

    toTableRow(deletecb) {
        let exp_fmt = new Intl.NumberFormat('en-US',
                        { style: 'currency', currency: 'USD',
                          minimumFractionDigits: 2 });
        var row = document.createElement('tr')
        var dt, st, cat, item, amt;
        for (let cell of ['date', 'store', 'category', 'item', 'amount']) {
            let td = document.createElement('td');
            td.setAttribute("id", cell)
            td.setAttribute("contenteditable", "true");
            if (cell == 'amount') {
                td.innerHTML = exp_fmt.format(this[cell])
            } else {
                td.innerHTML = this[cell]
            }
            row.appendChild(td)
        }
        let td = document.createElement('td')
        let butt = document.createElement('button')
        butt.id = this.id;
        butt.innerHTML = 'Delete';
        butt.onclick = function() {ec.deleteExpense(this.id); };
        td.appendChild(butt);
        row.appendChild(td);

        //add edit button
        let td1 = document.createElement('td');
        let editbutt1 = document.createElement('button');
        editbutt1.id = this.id;
        editbutt1.category = this.category;
        editbutt1.amount = this.amount;
        editbutt1.store = this.store;
        editbutt1.date = this.date;
        editbutt1.item = this.item;
        editbutt1.innerHTML = 'Edit';
        editbutt1.onclick = function() {ec.editExpense(this.id);};
        td1.appendChild(editbutt1);
        row.appendChild(td1);
        return row
    }

    match(key, value) {
      if (this[key] = value) {
        return true;
      } else {
        return false;

      }
    }
}


class ExpenseDB {
    constructor() {
        this.allExpenses = [];
    }

    newExpense(e) {
        this.allExpenses.push(e);
        this.saveMe(e)
    }

    getExpenses() {
        return this.allExpenses;
    }

/*
    sortBy(property){
      this.allExpenses.sort(function(a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result
        })
    }*/


    // searchTable() {
    //     var input, filter, found, table, tr, td, i, j;
    //     input = document.getElementById("inputsearch");
    //     filter = input.value.toUpperCase();
    //     var table = document.getElementById("expensetable");
    //     tr = table.getElementsByTagName("tr");
    //     for (i = 0; i < tr.length; i++) {
    //         td = tr[i].getElementsByTagName("td");
    //         for (j = 0; j < td.length; j++) {
    //             if (td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
    //                 found = true;
    //             }
    //         }
    //         if (found) {
    //             tr[i].style.display = "";
    //             found = false;
    //         } else {
    //             tr[i].style.display = "none";
    //         }
    //     }
    // }

    editExpense(id, newExpenseObject) {
        $.ajax({
           url: `http://localhost:8088/api/v1/expenses/${id}`,
           method: 'PUT',
           contentType: "application/json; charset=utf-8",
           data: JSON.stringify(newExpenseObject),
           dataType: "json",
        }).done(function(data) {
          $("#expensetable").trigger("edbupdate");
        });
    }

    deleteExpense(id) {
        let done = false;
        let i;
        for (i = 0; i < this.allExpenses.length && !done; i++) {
            if (this.allExpenses[i].id == id) {
                done = true;
            }
        }
        if (done) {
            this.allExpenses.splice(i-1,1);
            $.ajax({
                url: `http://localhost:8088/api/v1/expenses/${id}`,
                method: 'DELETE',
            }).done(function(data) {console.log('deleted')} );
            $("#expensetable").trigger("edbupdate") // trigger edbupdate event to cause table refresh
        }
    }

    reloadMe() {
        var waitfor = new $.Deferred();
        var self = this;
        $.ajax({
            url: "http://localhost:8088/api/v1/expenses"
        }).done(function(data) {
            for(let e of data) {
                e = new Expense(e.date, e.store, e.category, e.item, e.amount, e._id["$oid"]);
                self.allExpenses.push(e);
            }
            //waitfor.resolve()
            $("#expensetable").trigger("edbupdate") // trigger edbupdate event to cause table refresh
        });
        return waitfor;
    }

    saveMe(e) {
        //localStorage.expensedb = JSON.stringify(this.allExpenses);
        $.ajax({
            url: "http://localhost:8088/api/v1/expenses",
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(e),
            dataType: "json",
        }).done(function(data) {
            e.id = data._id["$oid"]
            $("#expensetable").trigger("edbupdate"); // trigger edbupdate event to cause table refresh
            }).fail(function() {alert("Could not save your expense.....")});
    }
}
