(function () {
  "use strict";

  const { formatDate, formatAmount } = window.NexonMvpAnalyzer.utils;
  const { getNextWeekSummary } = window.NexonMvpAnalyzer.mvp;

  function createPanel() {
    const existingPanel = document.getElementById("nma-panel");
    if (existingPanel) return existingPanel;

    const panel = document.createElement("div");
    panel.id = "nma-panel";
    panel.className = "nma-panel";
    panel.innerHTML = `
      <div class="nma-panel-header">
        <strong>넥슨 MVP 분석</strong>
        <button id="nma-close-button" class="nma-close-button" type="button">닫기</button>
      </div>
      <div id="nma-content">분석 버튼을 눌러주세요.</div>
    `;

    document.body.appendChild(panel);
    document.getElementById("nma-close-button").addEventListener("click", () => {
      panel.style.display = "none";
    });

    return panel;
  }

  function createAnalyzeButton(onClick) {
    if (document.getElementById("nma-analyze-button")) return;

    const button = document.createElement("button");
    button.id = "nma-analyze-button";
    button.className = "nma-analyze-button";
    button.type = "button";
    button.textContent = "MVP 분석";
    button.addEventListener("click", onClick);

    document.body.appendChild(button);
  }

  function setButtonLoading(isLoading) {
    const button = document.getElementById("nma-analyze-button");
    if (!button) return;

    button.disabled = isLoading;
    button.textContent = isLoading ? "분석 중..." : "MVP 분석";
  }

  function showPanel() {
    const panel = document.getElementById("nma-panel") || createPanel();
    panel.style.display = "block";
    return panel;
  }

  function setContent(html) {
    const content = document.getElementById("nma-content");
    if (content) content.innerHTML = html;
  }

  function renderLoading() {
    showPanel();
    setContent(`<div class="nma-loading">분석 중...</div>`);
  }

  function renderError(error) {
    showPanel();
    setContent(`
      <div class="nma-error">
        분석 중 오류가 발생했습니다.<br />
        넥슨 결제 페이지에 로그인되어 있는지 확인해주세요.<br />
        <small>${escapeHtml(error.message || String(error))}</small>
      </div>
    `);
  }

  function renderWeeklyResult(summary, dropInfo) {
    showPanel();

    const nextWeek = getNextWeekSummary(summary);

    setContent(`
      ${createCurrentGradeCard(summary)}
      ${createNextWeekCard(nextWeek, dropInfo)}
      ${createWeeklyTable(summary.weeks)}
    `);
  }

  function createCurrentGradeCard({ grade, total }) {
    return `
      <section class="nma-card">
        <div class="nma-label">현재 예상 MVP 등급</div>
        <div class="nma-grade">${grade.name}</div>
        <div class="nma-total">${formatAmount(total)}</div>
      </section>
    `;
  }

  function createNextWeekCard(nextWeek, dropInfo) {
    return `
      <section class="nma-card nma-card-warning">
        <div class="nma-title">다음주 예상 등급</div>
        <div>${formatDate(nextWeek.date)} 목요일 00:00 기준</div>
        <div>제외 예정 금액: ${formatAmount(nextWeek.amountDropping)}</div>
        <div>예상 누적 금액: ${formatAmount(nextWeek.total)} / 예상 등급: <b>${nextWeek.grade.name}</b></div>
        ${createDropInfo(dropInfo)}
      </section>
    `;
  }

  function createDropInfo(dropInfo) {
    if (!dropInfo) {
      return `<div>예상 등급 하락일: <b>20주 내 하락 예상 없음</b></div>`;
    }

    return `
      <div>예상 등급 하락일: <b>${formatDate(dropInfo.date)} 목요일 00:00</b></div>
      <div>하락 후 예상 등급: <b>${dropInfo.grade.name}</b> / 예상 누적 금액: ${formatAmount(dropInfo.total)}</div>
    `;
  }

  function createWeeklyTable(weeks) {
    const rowsHtml = weeks.map(createWeeklyRow).join("");

    return `
      <section>
        <div class="nma-section-title">MVP 주차별 사용 합계</div>
        <table class="nma-table">
          <thead>
            <tr>
              <th>기간</th>
              <th class="nma-right">금액</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </section>
    `;
  }

  function createWeeklyRow(week) {
    return `
      <tr>
        <td>
          <div class="nma-period">${formatDate(week.start)} ~ ${formatDate(week.end)}</div>
          <div class="nma-sub-text">${week.label}</div>
        </td>
        <td class="nma-right">${formatAmount(week.total)}</td>
      </tr>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.NexonMvpAnalyzer.ui = {
    createPanel,
    createAnalyzeButton,
    setButtonLoading,
    renderLoading,
    renderError,
    renderWeeklyResult,
  };
})();
