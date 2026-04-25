(function () {
  "use strict";

  const { API_URL, PAGE_DELAY_MS, RECENT_MONTH_COUNT } = window.NexonMvpAnalyzer.constants;
  const { sleep } = window.NexonMvpAnalyzer.utils;

  async function fetchCashHistory(year, month, cursor = 0) {
    const response = await fetch(API_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        accept: "application/graphql-response+json, application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query getNxCashHistoryDetailUseWithPaging($year: Int!, $month: Int!, $cursor: Int!) {
            nexonCashHistoryDetailUseWithPaging(year: $year, month: $month, cursor: $cursor) {
              useList {
                seqNo
                gameName
                purchaseAmount
                purchaseDate
                purchaseId
                purchaseItem
                purchaseStatus
              }
            }
          }
        `,
        variables: { year, month, cursor },
        operationName: "getNxCashHistoryDetailUseWithPaging",
      }),
    });

    if (!response.ok) {
      throw new Error(`넥슨 결제 내역 요청 실패: ${response.status}`);
    }

    const json = await response.json();

    if (json.errors?.length) {
      throw new Error(json.errors.map((error) => error.message).join("\n"));
    }

    return json;
  }

  async function fetchMonthHistory(year, month) {
    const result = [];
    let cursor = 0;

    while (true) {
      const json = await fetchCashHistory(year, month, cursor);
      const list = json?.data?.nexonCashHistoryDetailUseWithPaging?.useList ?? [];

      if (list.length === 0) break;

      result.push(...list);
      cursor += list.length;

      await sleep(PAGE_DELAY_MS);
    }

    return result;
  }

  function getRecentMonths(count = RECENT_MONTH_COUNT) {
    const now = new Date();
    const months = [];

    for (let i = 0; i < count; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      });
    }

    return months;
  }

  async function fetchRecentHistory() {
    const months = getRecentMonths();
    const all = [];

    for (const { year, month } of months) {
      const list = await fetchMonthHistory(year, month);
      all.push(...list);
    }

    return all;
  }

  window.NexonMvpAnalyzer.api = {
    fetchCashHistory,
    fetchMonthHistory,
    fetchRecentMonths: fetchRecentHistory,
    getRecentMonths,
  };
})();
