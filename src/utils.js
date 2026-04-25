(function () {
  "use strict";

  window.NexonMvpAnalyzer = window.NexonMvpAnalyzer || {};

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function parseNexonDate(dateText) {
    const [y, m, d] = dateText.match(/\d+/g).map(Number);
    return new Date(y, m - 1, d);
  }

  function formatAmount(amount) {
    return `${Number(amount || 0).toLocaleString()}원`;
  }

  window.NexonMvpAnalyzer.utils = {
    sleep,
    addDays,
    formatDate,
    parseNexonDate,
    formatAmount,
  };
})();
