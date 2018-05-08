class UomTable {
  constructor() {
    this.order = 'asc';
    this.table = document.querySelector(".uomTable");
    this.addDelegatedEvent();
  }

  addDelegatedEvent() {
    this.table.addEventListener("click", (e) => {
      console.log(e.target);
      this.sortTable();
    });
  }

  sortTable() {
    const tbody = document.querySelector('tbody');
    const tr = Array.from(tbody.querySelectorAll('tr'));
    const reverse = this.order === 'asc' ? 1 : -1;
    this.order = this.order === 'asc' ? 'desc' : 'asc';
    tr.sort((a, b) => (
      reverse * (a.cells[0].textContent.trim()
        .localeCompare(b.cells[0].textContent.trim(), undefined, { numeric: true })))
    );
    tr.forEach((row) => tbody.appendChild(row));
  }
}

const uomTable = new UomTable();
