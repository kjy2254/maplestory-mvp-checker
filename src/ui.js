(function () {
  "use strict";

  const { formatDate, formatAmount } = window.NexonMvpAnalyzer.utils;
  const { getNextWeekSummary } = window.NexonMvpAnalyzer.mvp;

  const GRADE_STYLE = {
    블랙: { bg: "#111", icon: "black" },
    레드: { bg: "#e53935", icon: "red" },
    다이아: { bg: "#00acc1", icon: "diamond" },
    골드: { bg: "#ffd54f", icon: "gold" },
    실버: { bg: "#cfd8dc", icon: "silver" },
    브론즈: { bg: "#8d6e63", icon: "bronze" },
  };

  function getIconUrl(name) {
    return chrome.runtime.getURL(`assets/${name}.png`);
  }

  function renderGradeBadge(gradeName) {
    if (gradeName === "일반") {
      return `<span class="nma-grade-text">없음</span>`;
    }

    const style = GRADE_STYLE[gradeName] || GRADE_STYLE["일반"];
    const iconUrl = getIconUrl(style.icon);

    return `
    <img src="${iconUrl}" class="nma-grade-icon" alt="${gradeName}" />
  `;
  }

  function createPanel() {
    const existingPanel = document.getElementById("nma-panel");
    if (existingPanel) return existingPanel;

    const panel = document.createElement("div");
    panel.id = "nma-panel";
    panel.className = "nma-panel";
    panel.innerHTML = `
      <div class="nma-panel-header">
        <div class="nma-header-title">
          <strong>메이플 MVP 분석</strong>
          <span class="nma-help-icon" tabindex="0">?</span>
          <div class="nma-tooltip">
            이 확장프로그램으로 반영되는 금액은 구매한 아이템 기준입니다.<br />
            인벤토리로 이동하지 않은 아이템 및 PC방 금액은 반영되지 않습니다.<br />
            실제 등급과 차이가 있을 수 있으니 참고용으로만 사용해주세요.
          </div>
        </div>
        <button id="nma-close-button" class="nma-close-button" type="button">닫기</button>
      </div>
      <div id="nma-content">분석 버튼을 눌러주세요.</div>
    `;

    document.body.appendChild(panel);
    document
      .getElementById("nma-close-button")
      .addEventListener("click", () => {
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
    <section class="nma-card nma-card-current">
      <div class="nma-label">현재 예상 MVP 등급</div>
      <div class="nma-grade">
        ${renderGradeBadge(grade.name)}
      </div>
      <div class="nma-total">${formatAmount(total)}</div>
    </section>
  `;
  }

  function createNextWeekCard(nextWeek, dropInfo) {
    return `
    <section class="nma-card nma-card-warning">
      <div class="nma-card-header">
        <div>
          <div class="nma-label">다음주 예상 등급</div>
          <div class="nma-grade nma-grade-small">
            ${renderGradeBadge(nextWeek.grade.name)}
          </div>
        </div>
        <div class="nma-date-badge">
          ${formatDate(nextWeek.date)}
        </div>
      </div>

      <div class="nma-summary-row">
        <span>예상 누적</span>
        <strong>${formatAmount(nextWeek.total)}</strong>
      </div>

      <div class="nma-detail-box">
        <div>
          <span>제외 예정</span>
          <b>${formatAmount(nextWeek.amountDropping)}</b>
        </div>
        ${createDropInfo(dropInfo)}
      </div>
    </section>
  `;
  }

  function createDropInfo(dropInfo) {
    if (!dropInfo) {
      return `
      <div>
        <span>하락 예상</span>
        <b>20주 내 없음</b>
      </div>
    `;
    }

    return `
    <div>
      <span>하락 예정일</span>
      <b>${formatDate(dropInfo.date)}</b>
    </div>
    <div>
      <span>하락 후 등급</span>
      <b>${dropInfo.grade.name} · ${formatAmount(dropInfo.total)}</b>
    </div>
  `;
  }

  function createWeeklyTable(weeks) {
    const rowsHtml = weeks.map(createWeeklyRow).join("");

    return `
      <section class="nma-card nma-card-weekly">
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
