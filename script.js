const STORAGE_KEY = "moneytrack_transactions_v1";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other"
];

let transactions = loadTransactions();

const elements = {
  balance: document.getElementById("balanceValue"),
  income: document.getElementById("incomeValue"),
  expenses: document.getElementById("expenseValue"),
  transactionList: document.getElementById("transactionList"),
  transactionCount: document.getElementById("transactionCount"),
  emptyTransactions: document.getElementById("emptyTransactions"),
  categorySummary: document.getElementById("categorySummary"),
  emptyCategories: document.getElementById("emptyCategories"),
  spendingChart: document.getElementById("spendingChart"),
  chartLegend: document.getElementById("chartLegend"),
  emptyChart: document.getElementById("emptyChart"),
  modal: document.getElementById("modalBackdrop"),
  form: document.getElementById("transactionForm"),
  name: document.getElementById("name"),
  amount: document.getElementById("amount"),
  category: document.getElementById("category"),
  date: document.getElementById("date"),
  type: document.getElementById("transactionType"),
  toast: document.getElementById("toast")
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2
});

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn("Could not load transactions:", error);
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatMoney(value) {
  return currency.format(value);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function calculateTotals() {
  return transactions.reduce((totals, transaction) => {
    if (transaction.type === "income") {
      totals.income += transaction.amount;
    } else {
      totals.expenses += transaction.amount;
    }
    totals.balance = totals.income - totals.expenses;
    return totals;
  }, { income: 0, expenses: 0, balance: 0 });
}

function renderSummary() {
  const totals = calculateTotals();

  elements.balance.textContent = formatMoney(totals.balance);
  elements.income.textContent = formatMoney(totals.income);
  elements.expenses.textContent = formatMoney(totals.expenses);

  elements.balance.style.color = totals.balance < 0 ? "var(--expense)" : "var(--text)";
}

function renderTransactions() {
  const sorted = [...transactions].sort((a, b) =>
    new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt
  );

  elements.transactionList.innerHTML = "";

  if (sorted.length === 0) {
    elements.emptyTransactions.style.display = "block";
    elements.transactionCount.textContent = "0 transactions";
    return;
  }

  elements.emptyTransactions.style.display = "none";
  elements.transactionCount.textContent =
    `${sorted.length} transaction${sorted.length === 1 ? "" : "s"}`;

  sorted.forEach((transaction) => {
    const row = document.createElement("tr");
    const sign = transaction.type === "income" ? "+" : "-";
    const typeClass = transaction.type === "income" ? "type-income" : "type-expense";
    const amountClass = transaction.type === "income" ? "amount-income" : "amount-expense";

    row.innerHTML = `
      <td>
        <div class="transaction-name">${escapeHtml(transaction.name)}</div>
        <div class="transaction-sub">${transaction.type === "income" ? "Money received" : "Money spent"}</div>
      </td>
      <td>${escapeHtml(transaction.category)}</td>
      <td>${formatDate(transaction.date)}</td>
      <td><span class="type-pill ${typeClass}">${transaction.type}</span></td>
      <td class="amount-cell ${amountClass}">${sign}${formatMoney(transaction.amount)}</td>
      <td>
        <button class="delete-btn" type="button" data-id="${transaction.id}" aria-label="Delete ${escapeHtml(transaction.name)}">Delete</button>
      </td>
    `;

    elements.transactionList.appendChild(row);
  });
}

function getExpenseByCategory() {
  const totals = Object.fromEntries(categories.map((category) => [category, 0]));

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      if (totals[transaction.category] !== undefined) {
        totals[transaction.category] += transaction.amount;
      }
    });

  return totals;
}

function renderCategories() {
  const totals = getExpenseByCategory();
  const entries = Object.entries(totals).filter(([, amount]) => amount > 0);
  const totalExpenses = entries.reduce((sum, [, amount]) => sum + amount, 0);

  elements.categorySummary.innerHTML = "";

  if (entries.length === 0) {
    elements.emptyCategories.style.display = "block";
    return;
  }

  elements.emptyCategories.style.display = "none";

  entries
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount]) => {
      const percentage = totalExpenses ? (amount / totalExpenses) * 100 : 0;
      const row = document.createElement("div");
      row.className = "category-row";
      row.innerHTML = `
        <span class="category-name">${escapeHtml(category)}</span>
        <div class="progress-track" title="${percentage.toFixed(1)}%">
          <div class="progress-bar" style="width: ${percentage}%"></div>
        </div>
        <span class="category-amount">${formatMoney(amount)}</span>
      `;
      elements.categorySummary.appendChild(row);
    });
}

function renderChart() {
  const totals = getExpenseByCategory();
  const entries = Object.entries(totals).filter(([, amount]) => amount > 0);
  elements.spendingChart.innerHTML = "";
  elements.chartLegend.innerHTML = "";

  if (entries.length === 0) {
    elements.emptyChart.style.display = "block";
    return;
  }

  elements.emptyChart.style.display = "none";

  const max = Math.max(...entries.map(([, amount]) => amount));

  entries
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount]) => {
      const group = document.createElement("div");
      group.className = "bar-group";

      const height = Math.max((amount / max) * 145, 8);

      group.innerHTML = `
        <span class="bar-value">${formatMoney(amount).replace("THB", "฿")}</span>
        <div class="bar" style="height: ${height}px" title="${escapeHtml(category)}: ${formatMoney(amount)}"></div>
        <span class="bar-label">${escapeHtml(category)}</span>
      `;

      elements.spendingChart.appendChild(group);

      const legend = document.createElement("span");
      legend.className = "legend-item";
      legend.innerHTML = `<span class="legend-dot"></span>${escapeHtml(category)}`;
      elements.chartLegend.appendChild(legend);
    });
}

function render() {
  renderSummary();
  renderTransactions();
  renderCategories();
  renderChart();
}

function openModal() {
  elements.modal.hidden = false;
  document.body.style.overflow = "hidden";
  elements.name.focus();
}

function closeModal() {
  elements.modal.hidden = true;
  document.body.style.overflow = "";
}

function resetForm() {
  elements.form.reset();
  elements.type.value = "expense";
  document.querySelectorAll(".type-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.type === "expense");
  });

  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  elements.date.value = localDate;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2200);
}

document.getElementById("openModalBtn").addEventListener("click", openModal);
document.getElementById("emptyAddBtn").addEventListener("click", openModal);
document.getElementById("closeModalBtn").addEventListener("click", closeModal);
document.getElementById("cancelBtn").addEventListener("click", closeModal);

elements.modal.addEventListener("click", (event) => {
  if (event.target === elements.modal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.modal.hidden) {
    closeModal();
  }
});

document.querySelectorAll(".type-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".type-btn").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    elements.type.value = button.dataset.type;
  });
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = elements.name.value.trim();
  const amount = Number(elements.amount.value);

  if (!name || !Number.isFinite(amount) || amount <= 0 || !elements.date.value) {
    showToast("Please enter valid transaction details.");
    return;
  }

  const transaction = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name,
    amount,
    type: elements.type.value,
    category: elements.category.value,
    date: elements.date.value,
    createdAt: Date.now()
  };

  transactions.push(transaction);
  saveTransactions();
  render();
  closeModal();
  resetForm();
  showToast("Transaction added.");
});

elements.transactionList.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-btn");
  if (!button) return;

  const id = button.dataset.id;
  transactions = transactions.filter((transaction) => transaction.id !== id);
  saveTransactions();
  render();
  showToast("Transaction deleted.");
});

resetForm();
render();
