"use strict";

class ExpenseController {
    constructor() {
        this.edb = new ExpenseDB();
    }

    sortBy(array, key) {
        return array.sort(function(a,b) {
            var result = (a[key] < b[key]) ? -1 : (a[key] > b[key]) ? 1 : 0;
            return result;
        })
    }

    filterBy(array, filterbyval) {
      return array.filter(function(e) {
        return e.date === filterbyval ||
               e.store === filterbyval ||
               e.category === filterbyval ||
               e.item === filterbyval ||
               e.amount === filterbyval;
      });
    }

    redrawTable(sortby=null, filterby=null) {
        let table = document.getElementById("expensetable").getElementsByTagName('tbody')[0]
        let rows = table.getElementsByTagName('tr')

        for (let i = 0; rows.length > 1; i++) {
            rows[1].remove();
        }

        let total = 0.0;

        var newExpensesArray = this.edb.getExpenses();

        if (filterby !== null) {
          if (filterby !== "") {
            newExpensesArray = this.filterBy(newExpensesArray, filterby);
          }

        }

        if (sortby !== null) {
          newExpensesArray = this.sortBy(newExpensesArray, sortby);
          sortby = null;
        }


        for(let e of newExpensesArray ) {
            table.appendChild(e.toTableRow());
            total += e.amount
        }
        let total_fmt = new Intl.NumberFormat('en-US',
                        { style: 'currency', currency: 'USD',
                          minimumFractionDigits: 2 });
        // add total row
        let row = document.createElement('tr')
        for(let i = 0; i < 5; i++) {
            let td = document.createElement('td')
            row.appendChild(td)
            if(i == 3) {
                td.innerHTML = "<strong>Total</strong>";
            } else if (i == 4) {
                td.innerHTML = `<strong> ${total_fmt.format(total)}</strong>`;
            }
        }

        table.appendChild(row);

    }

    newExpense() {

        var e = new Expense(document.getElementById('inputdate').value,
            document.getElementById('inputstore').value,
            document.getElementById('inputcategory').value,
            document.getElementById('inputitem').value,
            document.getElementById('inputamount').value);

        this.edb.newExpense(e);
    }

    updateTable() {
    }

    deleteExpense(id) {
        this.edb.deleteExpense(id);
    }

    editExpense(id) {
            var i = 0;
            for (let e of this.edb.allExpenses) {
              i+=1;
              if (e.id == id) {

                var tr = document.getElementById(id).parentNode.parentNode;
                this.edb.allExpenses[i-1].date = tr.firstChild.firstChild.data;
                this.edb.allExpenses[i-1].store = tr.firstChild.nextSibling.firstChild.data;
                this.edb.allExpenses[i-1].category = tr.firstChild.nextSibling.nextSibling.firstChild.data;
                this.edb.allExpenses[i-1].item = tr.firstChild.nextSibling.nextSibling.nextSibling.firstChild.data;
                this.edb.allExpenses[i-1].amount = tr.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.data;
                this.edb.editExpense(id, this.edb.allExpenses[i-1]);
              }
            }


        }

    filterby() {
        let filtercrit = this;
    }

    doReload() {
        var waitfor = this.edb.reloadMe();
        $("#expensetable").on("edbupdate", this.redrawTable.bind(this));  // every time an edbupdate event happens, call redrawTable

    }

}

var ec = new ExpenseController();

window.onload = function() {
    ec.doReload();
}
