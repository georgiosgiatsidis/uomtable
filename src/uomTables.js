  const hasClass = (el, className) =>
  !!el.className.match(new RegExp(`(\\s|^)${className}(\\s|$)`));

const addClass = (el, className) => {
  if (!hasClass(el, className)) el.className += ` ${className}`;
}

const removeClass = (el, className) => {
  if (hasClass(el,className)) {
    const reg = new RegExp(`(\\s|^)${className}(\\s|$)`);
    el.className = el.className.replace(reg,' ');
  }
}

class UomTable {
  constructor() {
    this.maths = {
    	min(arr) {
    		return Math.min.apply(null, arr);
    	},

    	max(arr) {
    		return Math.max.apply(null, arr);
    	},

    	mean(arr) {
    		let sum = 0;
    		for (let i = 0, l = arr.length; i < l; i++) sum += arr[i];
    		return sum / arr.length;
    	},

    	median(arr) {
    		arr.sort((a, b) => a - b);
    		const mid = arr.length / 2;
    		return mid % 1 ? arr[mid - 0.5] : (arr[mid - 1] + arr[mid]) / 2;
    	},

    	range(arr) {
    		return this.max(arr) - this.min(arr);
    	},

    	variance(arr) {
    		const mean = this.mean(arr);
    		return this.mean(arr.map(num => (num - mean) ** 2));
    	},

    	stdDev(arr) {
    		return Math.sqrt(this.variance(arr));
    	},
    };
    this.order = {};
    this.table = document.querySelector('.uomTable');
    this.selectOptions = {
      min: 'Min',
      max: 'Max',
      mean: 'Mean',
      median: 'Median',
      range: 'Range',
      variance: 'Variance',
      stdDev: 'Standard Deviation',
    };
    this.loadCSS();
    this.makeEditable();
    this.insertButtons();
    this.addDelegatedEvent();
    this.addSelectOptions();
    this.updateResults();
  }

  loadCSS() {
    document.write('<link rel="stylesheet" type="text/css" href="src/style.css">');
  }

  makeEditable() {
    const td = this.table.querySelectorAll('tbody tr td');
    td.forEach((el) => {
      el.setAttribute('contenteditable', true);
      el.onkeypress = () => {
        if (event.keyCode === 46 && el.innerHTML.split('.').length === 2) {
            return false;
        }
        if (event.keyCode != 46 && (event.keyCode < 48 || event.keyCode > 57)) {
          return false;
        }
      };
    });
  }

  insertButtons() {
    const rows = this.table.querySelectorAll('tr');
    rows.forEach((el, index) => {
      const cell = el.insertCell(-1);
      const deleteCell = el.insertCell(-1);
      if (index === 0) {
        return;
      }

      addClass(cell, 'copy');
      addClass(deleteCell, 'delete');
    })
  }

  addDelegatedEvent() {
    this.table.addEventListener('input', () => this.updateResults());

    this.table.querySelector('thead').addEventListener('click', (e) => {
      const colIndex = e.target.cellIndex;
      const rowIndex = e.target.parentNode.rowIndex;
      const rowLen = this.table.rows[0].cells.length;
      if (e.target.tagName === 'TD' && e.target.cellIndex !== rowLen - 1 && e.target.cellIndex !== rowLen - 2) {
        this.sortTable(colIndex);
      }
    });

    this.table.querySelector('tbody').addEventListener('click', (e) => {
      if (e.target.tagName === 'TD' && e.target.cellIndex === this.table.rows[0].cells.length - 2) {
        this.cloneRow(e.target.parentNode.rowIndex);
        this.updateResults();
      } else if (e.target.tagName === 'TD' && e.target.cellIndex === this.table.rows[0].cells.length - 1) {
        const rows = this.table.tBodies[0].getElementsByTagName('tr').length;
        if (rows <= 1) {
          window.alert('You cannot delete the last row');
          return;
        }
        e.target.parentNode.parentNode.removeChild(e.target.parentNode);
        this.updateResults();
      }
    });
  }

  cloneRow(rowIndex) {
    const tbody = this.table.tBodies[0];
    var node = this.table.rows[rowIndex].cloneNode(true);
    tbody.appendChild(node);
  }

  addSelectOptions() {
      const tfoot = this.table.querySelector('tfoot');
      const firstRow = tfoot.insertRow(0);
      const secondRow = tfoot.insertRow(1);

      for (let i = 0 ; i < this.table.rows[0].cells.length - 2 ; i+=1) {
        const firstCell = firstRow.insertCell(0);
        const secondCell = secondRow.insertCell(0);
        const select = document.createElement('SELECT');
        select.onchange = (event) => {
          const index = event.target.parentNode.cellIndex;
          switch (event.target.value) {
            case 'min':
              this.calculate(index, 'min');
              break;
            case 'max':
              this.calculate(index, 'max');
              break;
            case 'mean':
              this.calculate(index, 'mean');
              break;
            case 'median':
              this.calculate(index, 'median');
              break;
            case 'range':
              this.calculate(index, 'range');
              break;
            case 'variance':
              this.calculate(index, 'variance');
              break;
            case 'stdDev':
              this.calculate(index, 'stdDev');
              break;
            default:
              return;
          }
        }
        firstCell.appendChild(select);
        for (let index in this.selectOptions) {
          select.options[select.options.length] = new Option(this.selectOptions[index], index);
        }

        const result = document.createElement('SPAN');
        addClass(result, 'result');
        secondCell.appendChild(result);
      }
  }

  sortTable(colIndex) {
    const theadCols = this.table.querySelectorAll('thead tr td');
    theadCols.forEach((el) => {
      removeClass(el, 'active');
    });
    addClass(theadCols[colIndex], 'active');
    const tbody = this.table.querySelector('tbody');
    const tr = Array.from(tbody.querySelectorAll('tr'));
    if (this.order[colIndex] === undefined)
      this.order[colIndex] = 'asc';
    const order = this.order[colIndex] === 'asc' ? 1 : -1;
    this.order[colIndex] = this.order[colIndex] === 'asc' ? 'desc' : 'asc';
    tr.sort((a, b) => (
      order * (a.cells[colIndex].textContent.trim()
        .localeCompare(b.cells[colIndex].textContent.trim(), undefined, { numeric: true })))
    );
    tr.forEach((row) => tbody.appendChild(row));
  }

  calculate(index, func) {
    let result = 0;
    const cols = Array.from(this.table.querySelectorAll(`tbody tr td:nth-of-type(${index + 1})`));
    const intCols = cols.map(col => parseInt(col.innerHTML, 10));

    switch (func) {
      case 'min':
        result = this.maths.min(intCols);
        break;
      case 'max':
        result = this.maths.max(intCols);
        break;
      case 'mean':
        result = this.maths.mean(intCols);
        break;
      case 'median':
        result = this.maths.median(intCols);
        break;
      case 'range':
        result = this.maths.range(intCols);
        break;
      case 'variance':
        result = this.maths.variance(intCols);
        break;
      case 'stdDev':
        result = this.maths.stdDev(intCols);
        break;
      default:
        return;
    }
    const resultSpan = this.table.querySelector(`tfoot tr:last-child td:nth-of-type(${index + 1})`);
    resultSpan.innerHTML = result.toFixed(2);
  }

  updateResults() {
    const options = this.table.querySelectorAll('select option:checked');
    options.forEach((opt, i) => {
      this.calculate(i, opt.value);
    });
  }
}

const uomTable = new UomTable();
