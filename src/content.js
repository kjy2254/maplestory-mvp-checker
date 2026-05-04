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

  const PC_CAFE_STORAGE_KEY = "pcCafeWeeklyData";

  async function loadPcCafeData() {
    const result = await chrome.storage.local.get(PC_CAFE_STORAGE_KEY);
    return result[PC_CAFE_STORAGE_KEY] || {};
  }

  async function handleAnalyzeClick() {
    renderLoading();
    setButtonLoading(true);

    try {
      const history = await fetchRecentHistory();
      const mapleItems = filterMapleStoryItems(history);
      const pcCafeData = await loadPcCafeData();

      const summary = getCurrentMvpSummary(mapleItems, pcCafeData);
      const dropInfo = getFutureGradeDrop(summary, mapleItems, pcCafeData);

      renderWeeklyResult(summary, dropInfo);
    } catch (error) {
      console.error("[Nexon MVP Analyzer]", error);
      renderError(error);
    } finally {
      setButtonLoading(false);
    }
  }

  function init() {
    createAnalyzeButton(handleAnalyzeClick);
  }

  init();
})();
