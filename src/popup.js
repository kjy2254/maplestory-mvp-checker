(function () {
  "use strict";

  window.NexonMvpAnalyzer = window.NexonMvpAnalyzer || {};

  const STORAGE_KEY = "pcCafeWeeklyData";
  const MINUTES_PER_100_WON = 6;

  const { formatDate } = window.NexonMvpAnalyzer.utils;

  document.addEventListener("DOMContentLoaded", () => {
    renderGuideView();
  });

  function renderGuideView() {
    const root = document.getElementById("popup-root");
    root.classList.remove("is-form");

    root.innerHTML = `
    <header class="popup-header">
      <h1>MapleStory MVP Checker</h1>
      <p>넥슨 결제 내역을 기준으로 MVP 등급을 분석합니다.</p>
    </header>

    <section class="guide-card">
      <div class="guide-title">사용 방법</div>

      <ol class="guide-list">
        <li>
          <a href="https://payment.nexon.com" target="_blank">
            https://payment.nexon.com
          </a>
          에 접속합니다.
        </li>
        <li>로그인 후 우측 하단의 <b>MVP 분석</b> 버튼을 클릭합니다.</li>
      </ol>

      <p class="guide-note">
        PC방 금액의 경우 아래 버튼을 눌러 수동으로 입력할 수 있습니다.
      </p>
    </section>

    <button id="open-pc-cafe-form" class="primary-button" type="button">
      PC방 금액 입력하기
    </button>
  `;

    document
      .getElementById("open-pc-cafe-form")
      .addEventListener("click", async () => {
        await renderPcCafeFormView();
      });
  }

  async function renderPcCafeFormView() {
    const root = document.getElementById("popup-root");
    root.classList.add("is-form");

    root.innerHTML = `
    <header class="popup-header">
      <h1>PC방 금액 입력</h1>
      <p>6분당 100원 기준으로 계산됩니다.</p>
    </header>

    <section id="pc-cafe-form" class="week-list"></section>

    <footer class="popup-footer">
      <button id="back-button" type="button">뒤로</button>
      <button id="save-button" type="button">저장</button>
      <button id="reset-button" type="button">초기화</button>
    </footer>

    <div id="status-message" class="status-message"></div>
  `;

    renderWeekRows();

    const savedData = await loadPcCafeData();
    applySavedData(savedData);

    document
      .getElementById("back-button")
      .addEventListener("click", renderGuideView);
    document.getElementById("save-button").addEventListener("click", saveData);
    document
      .getElementById("reset-button")
      .addEventListener("click", resetData);
  }

  function renderWeekRows() {
    const container = document.getElementById("pc-cafe-form");
    const weeks = getRecentMvpWeeks(13);

    container.innerHTML = weeks.map(createWeekRow).join("");

    container.querySelectorAll(".minute-input").forEach((input) => {
      input.addEventListener("input", handleMinuteInput);
    });

    container.querySelectorAll(".amount-input").forEach((input) => {
      input.addEventListener("input", handleAmountInput);
    });
  }

  function createWeekRow(week) {
    return `
      <div class="week-row" data-week-key="${week.key}">
        <div>
          <div class="week-period">${formatDate(week.start)} ~ ${formatDate(week.end)}</div>
          <div class="week-label">${week.label}</div>
        </div>

        <div class="input-box">
          <label>시간(분)</label>
          <input class="minute-input" type="number" min="0" step="6" placeholder="0" />
        </div>

        <div class="input-box">
          <label>금액(원)</label>
          <input class="amount-input" type="number" min="0" step="100" placeholder="0" />
        </div>
      </div>
    `;
  }

  function handleMinuteInput(event) {
    const row = event.target.closest(".week-row");
    const minuteInput = row.querySelector(".minute-input");
    const amountInput = row.querySelector(".amount-input");

    const minutes = toNumber(minuteInput.value);
    amountInput.value = minutesToAmount(minutes) || "";
  }

  function handleAmountInput(event) {
    const row = event.target.closest(".week-row");
    const minuteInput = row.querySelector(".minute-input");
    const amountInput = row.querySelector(".amount-input");

    const amount = toNumber(amountInput.value);
    minuteInput.value = amountToMinutes(amount) || "";
  }

  function minutesToAmount(minutes) {
    return Math.floor(minutes / MINUTES_PER_100_WON) * 100;
  }

  function amountToMinutes(amount) {
    return Math.floor(amount / 100) * MINUTES_PER_100_WON;
  }

  async function saveData() {
    const rows = [...document.querySelectorAll(".week-row")];
    const data = {};

    rows.forEach((row) => {
      const key = row.dataset.weekKey;
      const minutes = toNumber(row.querySelector(".minute-input").value);
      const amount = toNumber(row.querySelector(".amount-input").value);

      if (minutes > 0 || amount > 0) {
        data[key] = { minutes, amount };
      }
    });

    await chrome.storage.local.set({ [STORAGE_KEY]: data });
    showStatus("저장되었습니다.");
  }

  async function resetData() {
    if (!confirm("입력한 PC방 금액을 모두 초기화할까요?")) return;

    await chrome.storage.local.remove(STORAGE_KEY);

    document
      .querySelectorAll(".minute-input, .amount-input")
      .forEach((input) => {
        input.value = "";
      });

    showStatus("초기화되었습니다.");
  }

  async function loadPcCafeData() {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || {};
  }

  function applySavedData(data) {
    Object.entries(data).forEach(([weekKey, value]) => {
      const row = document.querySelector(`[data-week-key="${weekKey}"]`);
      if (!row) return;

      row.querySelector(".minute-input").value = value.minutes || "";
      row.querySelector(".amount-input").value = value.amount || "";
    });
  }

  function getRecentMvpWeeks(count = 13) {
    const thisWeekStart = getMvpWeekStart();
    const weeks = [];

    for (let i = 0; i < count; i++) {
      const start = addDays(thisWeekStart, -7 * i);
      const end = addDays(start, 6);

      weeks.push({
        key: formatDate(start),
        start,
        end,
        label: i === 0 ? "이번 주" : `${i}주 전`,
      });
    }

    return weeks;
  }

  function getMvpWeekStart(baseDate = new Date()) {
    const date = new Date(baseDate);
    date.setHours(0, 0, 0, 0);

    const day = date.getDay();
    const diff = (day - 4 + 7) % 7;

    date.setDate(date.getDate() - diff);
    return date;
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function toNumber(value) {
    return Number(value || 0);
  }

  function showStatus(message) {
    const status = document.getElementById("status-message");
    status.textContent = message;

    setTimeout(() => {
      status.textContent = "";
    }, 1800);
  }
})();
