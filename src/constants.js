(function () {
  "use strict";

  window.NexonMvpAnalyzer = window.NexonMvpAnalyzer || {};

  window.NexonMvpAnalyzer.constants = {
    API_URL: "https://public.api.nexon.com/billing-bff/mycash",
    PAGE_DELAY_MS: 300,
    RECENT_MONTH_COUNT: 4,
    MVP_WEEK_COUNT: 13,
    FUTURE_DROP_CHECK_WEEKS: 20,
    MVP_GRADES: [
      { name: "블랙", amount: 3000000 },
      { name: "레드", amount: 1500000 },
      { name: "다이아", amount: 900000 },
      { name: "골드", amount: 600000 },
      { name: "실버", amount: 300000 },
      { name: "브론즈", amount: 150000 },
      { name: "일반", amount: 0 },
    ],
  };
})();
