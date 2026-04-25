(function () {
  "use strict";

  const { fetchRecentHistory } = window.NexonMvpAnalyzer.api;
  const { getCurrentMvpSummary, getFutureGradeDrop } = window.NexonMvpAnalyzer.mvp;
  const { createPanel, createAnalyzeButton, setButtonLoading, renderLoading, renderError, renderWeeklyResult } = window.NexonMvpAnalyzer.ui;

  async function handleAnalyzeClick() {
    renderLoading();
    setButtonLoading(true);

    try {
      const history = await fetchRecentHistory();
      const summary = getCurrentMvpSummary(history);
      const dropInfo = getFutureGradeDrop(summary, history);

      renderWeeklyResult(summary, dropInfo);
    } catch (error) {
      console.error("[Nexon MVP Analyzer]", error);
      renderError(error);
    } finally {
      setButtonLoading(false);
    }
  }

  function init() {
    createPanel();
    createAnalyzeButton(handleAnalyzeClick);
  }

  init();
})();
