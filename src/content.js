(function () {
  "use strict";

  const { fetchRecentHistory } = window.NexonMvpAnalyzer.api;
  const { getCurrentMvpSummary, getFutureGradeDrop, filterMapleStoryItems } =
    window.NexonMvpAnalyzer.mvp;
  const {
    createPanel,
    createAnalyzeButton,
    setButtonLoading,
    renderLoading,
    renderError,
    renderWeeklyResult,
  } = window.NexonMvpAnalyzer.ui;

  async function handleAnalyzeClick() {
    renderLoading();
    setButtonLoading(true);

    try {
      const history = await fetchRecentHistory();
      const mapleItems = filterMapleStoryItems(history);
      const summary = getCurrentMvpSummary(mapleItems);
      const dropInfo = getFutureGradeDrop(summary, mapleItems);

      renderWeeklyResult(summary, dropInfo);
    } catch (error) {
      console.error("[Nexon MVP Analyzer]", error);
      renderError(error);
    } finally {
      setButtonLoading(false);
    }
  }

  function init() {
    // createPanel();
    createAnalyzeButton(handleAnalyzeClick);
  }

  init();
})();
