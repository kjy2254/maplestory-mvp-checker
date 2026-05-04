(function () {
  "use strict";

  const { MVP_GRADES, MVP_WEEK_COUNT, FUTURE_DROP_CHECK_WEEKS } =
    window.NexonMvpAnalyzer.constants;
  const { addDays, parseNexonDate, formatDate } = window.NexonMvpAnalyzer.utils;

  function getMvpWeekStart(baseDate = new Date()) {
    const date = new Date(baseDate);
    date.setHours(0, 0, 0, 0);

    const day = date.getDay(); // 일0 월1 화2 수3 목4 금5 토6
    const diff = (day - 4 + 7) % 7;

    date.setDate(date.getDate() - diff);
    return date;
  }

  function getMvpPeriod(baseDate = new Date()) {
    const weekStart = getMvpWeekStart(baseDate);

    const start = addDays(weekStart, -12 * 7);
    const end = addDays(weekStart, 7);
    end.setMilliseconds(end.getMilliseconds() - 1);

    return { start, end };
  }

  function getGrade(amount) {
    return (
      MVP_GRADES.find((grade) => amount >= grade.amount) ??
      MVP_GRADES[MVP_GRADES.length - 1]
    );
  }

  function getWeeklyTotalsByBaseWeek(
    items,
    baseWeekStart,
    weekCount = 13,
    pcCafeData = {},
  ) {
    const weeks = [];

    for (let i = 0; i < weekCount; i++) {
      const start = addDays(baseWeekStart, -7 * i);
      const end = addDays(start, 6);
      const weekKey = formatDate(start);

      const itemTotal = items.reduce((sum, item) => {
        const date = parseNexonDate(item.purchaseDate);
        date.setHours(0, 0, 0, 0);

        return date >= start && date <= end
          ? sum + Number(item.purchaseAmount ?? 0)
          : sum;
      }, 0);

      const pcAmount = Number(pcCafeData[weekKey]?.amount || 0);
      const total = itemTotal + pcAmount;

      weeks.push({
        index: i,
        label: i === 0 ? "해당 주" : `${i}주 전`,
        start,
        end,
        itemTotal,
        pcAmount,
        total,
      });
    }

    return weeks;
  }

  function getWeeklyTotals(items, weekCount = MVP_WEEK_COUNT, pcCafeData = {}) {
    const thisWeekStart = getMvpWeekStart();
    const weeks = [];

    for (let i = 0; i < weekCount; i++) {
      const start = addDays(thisWeekStart, -7 * i);
      const end = addDays(start, 6);
      const weekKey = formatDate(start);

      const itemTotal = items.reduce((sum, item) => {
        const date = parseNexonDate(item.purchaseDate);
        date.setHours(0, 0, 0, 0);

        return date >= start && date <= end
          ? sum + Number(item.purchaseAmount ?? 0)
          : sum;
      }, 0);

      const pcAmount = Number(pcCafeData[weekKey]?.amount || 0);
      const total = itemTotal + pcAmount;

      weeks.push({
        index: i,
        label: i === 0 ? "이번 주" : `${i}주 전`,
        start,
        end,
        itemTotal,
        pcAmount,
        total,
      });
    }

    return weeks;
  }

  function getCurrentMvpSummary(items, pcCafeData = {}) {
    const weeks = getWeeklyTotals(items, 13, pcCafeData);
    const total = weeks.reduce((sum, week) => sum + week.total, 0);
    const grade = getGrade(total);

    return { weeks, total, grade };
  }

  function getNextWeekSummary(summary) {
    const { weeks, total } = summary;
    const nextThursday = addDays(getMvpWeekStart(), 7);
    const amountDropping = weeks[weeks.length - 1]?.total ?? 0;
    const nextTotal = total - amountDropping;
    const nextGrade = getGrade(nextTotal);

    return {
      date: nextThursday,
      amountDropping,
      total: nextTotal,
      grade: nextGrade,
    };
  }

  function getFutureGradeDrop(
    summary,
    items,
    pcCafeData = {},
    maxWeeks = FUTURE_DROP_CHECK_WEEKS,
  ) {
    const currentGrade = summary.grade;
    const thisWeekStart = getMvpWeekStart();

    for (let i = 1; i <= maxWeeks; i++) {
      const baseWeekStart = addDays(thisWeekStart, 7 * i);

      const weeks = getWeeklyTotalsByBaseWeek(
        items,
        baseWeekStart,
        13,
        pcCafeData,
      );
      const total = weeks.reduce((sum, week) => sum + week.total, 0);
      const grade = getGrade(total);

      if (grade.amount < currentGrade.amount) {
        return {
          date: baseWeekStart,
          grade,
          total,
        };
      }
    }

    return null;
  }

  function filterMapleStoryItems(items) {
    return items.filter((item) => {
      const gameName = item.gameName || "";
      return gameName.includes("메이플");
    });
  }

  window.NexonMvpAnalyzer.mvp = {
    getMvpWeekStart,
    getMvpPeriod,
    getGrade,
    getWeeklyTotals,
    getWeeklyTotalsByBaseWeek,
    getCurrentMvpSummary,
    getNextWeekSummary,
    getFutureGradeDrop,
    filterMapleStoryItems,
  };
})();
