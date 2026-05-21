export type LanguageCode = "en" | "vi" | "fr" | "es";

export interface AppCopy {
  languageName: string;
  nav: {
    matchCentre: string;
    groupStandings: string;
    teamFocus: string;
    analytics: string;
  };
  header: {
    eyebrow: string;
    title: string;
    description: string;
    lastSnapshot: string;
    teamsSuffix: string;
    loading: string;
    noData: string;
  };
  summary: {
    favorite: string;
    averageProbability: string;
    averageDetail: string;
    highestRanked: string;
    fifaRank: string;
    marketSource: string;
    snapshotDate: string;
    notAvailable: string;
  };
  automation: {
    eyebrow: string;
    lastAutoUpdate: string;
    nextScheduledUpdate: string;
    dataSourceStatus: string;
    runMode: string;
    notScheduled: string;
    target: string;
    staticBuild: string;
    liveLocal: string;
  };
  controls: {
    eyebrow: string;
    title: string;
    description: string;
    snapshotDate: string;
    prev: string;
    next: string;
    today: string;
    futureDatesNote: string;
    confederation: string;
    allConfederations: string;
    group: string;
    allGroups: string;
    scope: string;
    allTeams: string;
    top10: string;
    top20: string;
    team: string;
    normalizedMode: string;
    fifaMode: string;
    downloadCsv: string;
    downloadPng: string;
  };
  sections: {
    matchCentreEyebrow: string;
    matchCentreTitle: string;
    matchCentreDescription: string;
    teamFocusEyebrow: string;
    teamFocusTitle: string;
    teamFocusDescription: string;
    analyticsEyebrow: string;
    analyticsTitle: string;
    analyticsDescription: string;
    methodologyEyebrow: string;
    methodologyTitle: string;
  };
  schedule: {
    upcomingEyebrow: string;
    upcomingTitle: string;
    upcomingDescription: string;
    groupStage: string;
    completedEyebrow: string;
    completedTitle: string;
    completedDescription: string;
    recentEyebrow: string;
    recentDescription: string;
    selectedScheduleEyebrow: string;
    selectedScheduleDescription: string;
    matchCalendar: string;
    yourLocalTime: string;
    group: string;
    matchday: string;
    final: string;
    noCompleted: string;
    noRecentPrefix: string;
    noRecentSuffix: string;
    status: {
      completed: string;
      today: string;
      upcoming: string;
    };
  };
  groupStandings: {
    eyebrow: string;
    title: string;
    description: string;
    standings: string;
    ptsForm: string;
    team: string;
    noResults: string;
  };
  selectedTeam: {
    summaryEyebrow: string;
    stageEyebrow: string;
    stageTitle: string;
    stageDescription: string;
    group: string;
    confederation: string;
    bookmakerOdds: string;
    advanceOdds: string;
    normalizedProbability: string;
    fifaRanking: string;
    snapshotDate: string;
    notAvailable: string;
    stage: string;
    probability: string;
    stageLabels: {
      roundOf32: string;
      roundOf16: string;
      quarterfinal: string;
      semifinal: string;
      final: string;
      champion: string;
    };
  };
  comparison: {
    snapshotEyebrow: string;
    snapshotTitle: string;
    snapshotDescription: string;
    previousSnapshot: string;
    noPreviousSnapshot: string;
    titleProbability: string;
    advanceProbability: string;
    bookmakerOdds: string;
    fifaRanking: string;
    comparisonEyebrow: string;
    comparisonTitle: string;
    comparisonTeam: string;
    chooseSecondTeam: string;
    titleOdds: string;
    winProbability: string;
    advanceGap: string;
    winProbabilityGap: string;
    headToHeadTitle: string;
    unavailable: string;
  };
  methodology: {
    card1Title: string;
    card1Body: string;
    card2Title: string;
    card2Body: string;
    card3Title: string;
    card3Body: string;
    card4Title: string;
    card4Body: string;
    footer: string;
  };
  counter: {
    previewLabel: string;
    pageViewsLabel: string;
    localViews: string;
    pageViews: string;
    previewMessage: string;
    loading: string;
    unavailable: string;
  };
  language: {
    label: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

export const supportedLanguages: Array<{ code: LanguageCode; label: string }> = [
  { code: "en", label: "EN" },
  { code: "vi", label: "VI" },
  { code: "fr", label: "FR" },
  { code: "es", label: "ES" },
];

export function detectPreferredLanguage(): LanguageCode {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase();
    if (normalized.startsWith("vi")) return "vi";
    if (normalized.startsWith("fr")) return "fr";
    if (normalized.startsWith("es")) return "es";
    if (normalized.startsWith("en")) return "en";
  }

  return "en";
}

export const copy: Record<LanguageCode, AppCopy> = {
  en: {
    languageName: "English",
    nav: {
      matchCentre: "Match Centre",
      groupStandings: "Group Standings",
      teamFocus: "Team Focus",
      analytics: "Analytics",
    },
    header: {
      eyebrow: "Daily Snapshot App",
      title: "World Cup 2026 Win Probability Map",
      description:
        "A bookmaker-led World Cup dashboard with daily snapshot history, map selection, stage-probability estimates, and automation-ready data files for all 48 qualified teams.",
      lastSnapshot: "Last Snapshot",
      teamsSuffix: "teams",
      loading: "Loading history...",
      noData: "No snapshot data is available yet.",
    },
    summary: {
      favorite: "Favorite",
      averageProbability: "Average Probability",
      averageDetail: "Normalized across the full 48-team field",
      highestRanked: "Highest-Ranked Team",
      fifaRank: "FIFA rank",
      marketSource: "Market Source",
      snapshotDate: "Snapshot date",
      notAvailable: "N/A",
    },
    automation: {
      eyebrow: "Daily Update Status",
      lastAutoUpdate: "Last auto update",
      nextScheduledUpdate: "Next scheduled update",
      dataSourceStatus: "Data source status",
      runMode: "Run mode",
      notScheduled: "Not scheduled yet",
      target: "Target",
      staticBuild: "Static build snapshot",
      liveLocal: "Live local app",
    },
    controls: {
      eyebrow: "Controls",
      title: "Snapshot Controls",
      description:
        "Choose the date, filter the field, switch the color mode, and export the current dashboard view right before diving into the selected team's details.",
      snapshotDate: "Snapshot date",
      prev: "Prev",
      next: "Next",
      today: "Today",
      futureDatesNote: "Future dates stay disabled. Today is highlighted when selected.",
      confederation: "Confederation",
      allConfederations: "All confederations",
      group: "Group",
      allGroups: "All groups",
      scope: "Scope",
      allTeams: "All 48 teams",
      top10: "Top 10 teams",
      top20: "Top 20 teams",
      team: "Team",
      normalizedMode: "Color by normalized probability",
      fifaMode: "Color by FIFA ranking",
      downloadCsv: "Download CSV",
      downloadPng: "Download PNG Screenshot",
    },
    sections: {
      matchCentreEyebrow: "Match Centre",
      matchCentreTitle: "Fixtures, Results, and Group Context",
      matchCentreDescription:
        "The tournament flow is grouped together here, so upcoming matches, completed games, table position, and the selected team's schedule all sit in one reading sequence.",
      teamFocusEyebrow: "Team Focus",
      teamFocusTitle: "Selected Team and Comparison View",
      teamFocusDescription:
        "The selected team now anchors the center of the dashboard, while recent form and comparison tools are grouped into cleaner rows so the page feels more deliberate.",
      analyticsEyebrow: "Analytics",
      analyticsTitle: "Trend and Probability Breakdown",
      analyticsDescription:
        "Historical movement, favorite ordering, and the full filtered field are grouped below the map so the page moves naturally from overview into deeper analytical detail.",
      methodologyEyebrow: "Methodology",
      methodologyTitle: "How the upgraded model works",
    },
    schedule: {
      upcomingEyebrow: "Upcoming Matches",
      upcomingTitle: "Tournament Schedule Pulse",
      upcomingDescription:
        "Official-style group-stage fixtures are now grouped by calendar day, while kickoff times automatically shift to the viewer's local timezone.",
      groupStage: "Group Stage",
      completedEyebrow: "Completed Matches",
      completedTitle: "Recently Completed Fixtures",
      completedDescription:
        "This result board adds recent context for title-probability changes, making the snapshot feel tied to on-field progress.",
      recentEyebrow: "Recent Results",
      recentDescription:
        "The most recent completed fixtures for the selected team, highlighted so it is easier to connect form with probability movement.",
      selectedScheduleEyebrow: "Selected Team Schedule",
      selectedScheduleDescription:
        "This panel follows the selected team's official three-match group schedule, with kickoff times shown in the viewer's timezone.",
      matchCalendar: "Match Calendar",
      yourLocalTime: "Your local time",
      group: "Group",
      matchday: "Matchday",
      final: "Final",
      noCompleted: "No matches are completed yet for the selected snapshot date.",
      noRecentPrefix: "",
      noRecentSuffix: "has not completed a match by this snapshot date yet.",
      status: {
        completed: "completed",
        today: "today",
        upcoming: "upcoming",
      },
    },
    groupStandings: {
      eyebrow: "Group Standings",
      title: "Live Group Table Snapshot",
      description:
        "Each table updates from the generated completed fixtures for the selected snapshot date. Form shows the latest group-stage results for each team using a simple win, draw, loss sequence.",
      standings: "Standings",
      ptsForm: "Pts / Form",
      team: "Team",
      noResults: "No results yet",
    },
    selectedTeam: {
      summaryEyebrow: "Selected Team",
      stageEyebrow: "Stage Table",
      stageTitle: "Estimated Path Through The Tournament",
      stageDescription:
        "Group advancement uses market odds directly. Later rounds are modeled from title odds so the stage path stays internally consistent.",
      group: "Group",
      confederation: "Confederation",
      bookmakerOdds: "Bookmaker title odds",
      advanceOdds: "Advance-from-group odds",
      normalizedProbability: "Normalized title probability",
      fifaRanking: "FIFA ranking",
      snapshotDate: "Snapshot date",
      notAvailable: "N/A",
      stage: "Stage",
      probability: "Probability",
      stageLabels: {
        roundOf32: "Reach Round of 32",
        roundOf16: "Reach Round of 16",
        quarterfinal: "Reach Quarterfinal",
        semifinal: "Reach Semifinal",
        final: "Reach Final",
        champion: "Win Tournament",
      },
    },
    comparison: {
      snapshotEyebrow: "Snapshot Comparison",
      snapshotTitle: "Compare Against The Previous Snapshot",
      snapshotDescription: "This compares the selected team on",
      previousSnapshot: "Previous snapshot",
      noPreviousSnapshot: "No previous snapshot available",
      titleProbability: "Title probability",
      advanceProbability: "Advance-from-group",
      bookmakerOdds: "Bookmaker title odds",
      fifaRanking: "FIFA ranking",
      comparisonEyebrow: "Team Comparison",
      comparisonTitle: "Compare Two Teams",
      comparisonTeam: "Comparison team",
      chooseSecondTeam: "Choose a second team",
      titleOdds: "Title odds",
      winProbability: "Win probability",
      advanceGap: "Advance gap",
      winProbabilityGap: "Win probability gap",
      headToHeadTitle: "Head-to-head snapshot difference",
      unavailable: "There is no earlier snapshot for this selected date yet, so snapshot-to-snapshot comparison is unavailable.",
    },
    methodology: {
      card1Title: "1. Bookmaker odds drive title chances",
      card1Body:
        "Title markets are converted from American odds to implied probability using the standard positive and negative odds formulas.",
      card2Title: "2. Normalize to 100%",
      card2Body:
        "All implied title probabilities are normalized so the entire 48-team field sums to exactly 100%, making side-by-side comparisons cleaner.",
      card3Title: "3. Save a daily snapshot",
      card3Body:
        "Each daily refresh appends or replaces the selected date in the history file, which powers the date switcher and the trend chart.",
      card4Title: "4. Model stage progression",
      card4Body:
        "Group-advancement odds come directly from market prices. Later knockout-stage probabilities are estimated from the relationship between group advancement and tournament-winning probability.",
      footer:
        "FIFA ranking remains contextual only. The map can also switch to a ranking color mode, but the main ordering and historical trend logic are all based on bookmaker-derived title probability snapshots.",
    },
    counter: {
      previewLabel: "Preview counter",
      pageViewsLabel: "Page views",
      localViews: "Local page views",
      pageViews: "Page views",
      previewMessage: "Preview counter while running locally.",
      loading: "Loading visit count...",
      unavailable: "Visit count is unavailable right now.",
    },
    language: {
      label: "Language",
    },
    seo: {
      title: "World Cup 2026 Win Probability Map",
      description:
        "Interactive World Cup 2026 probability dashboard with bookmaker odds, world map, team comparison, group standings, schedules, and daily snapshot history.",
      keywords:
        "World Cup 2026, World Cup 2026 probability, FIFA World Cup odds, World Cup win probability map, football analytics, bookmaker odds dashboard, World Cup schedule, group standings",
    },
  },
  vi: {
    languageName: "Tiếng Việt",
    nav: {
      matchCentre: "Trung tâm trận đấu",
      groupStandings: "Bảng xếp hạng bảng",
      teamFocus: "Trọng tâm đội",
      analytics: "Phân tích",
    },
    header: {
      eyebrow: "Ứng dụng snapshot hằng ngày",
      title: "Bản Đồ Xác Suất Vô Địch World Cup 2026",
      description:
        "Bảng điều khiển World Cup dựa trên odds nhà cái, có lịch sử snapshot hằng ngày, chọn đội trên bản đồ, xác suất từng vòng, và dữ liệu sẵn sàng cho tự động hóa của toàn bộ 48 đội đã giành vé.",
      lastSnapshot: "Snapshot mới nhất",
      teamsSuffix: "đội",
      loading: "Đang tải lịch sử dữ liệu...",
      noData: "Hiện chưa có dữ liệu snapshot.",
    },
    summary: {
      favorite: "Ứng viên số 1",
      averageProbability: "Xác suất trung bình",
      averageDetail: "Chuẩn hóa trên toàn bộ 48 đội",
      highestRanked: "Đội có hạng FIFA cao nhất",
      fifaRank: "Hạng FIFA",
      marketSource: "Nguồn thị trường",
      snapshotDate: "Ngày snapshot",
      notAvailable: "Không có",
    },
    automation: {
      eyebrow: "Trạng thái cập nhật hằng ngày",
      lastAutoUpdate: "Lần tự cập nhật gần nhất",
      nextScheduledUpdate: "Lần cập nhật kế tiếp",
      dataSourceStatus: "Trạng thái nguồn dữ liệu",
      runMode: "Chế độ chạy",
      notScheduled: "Chưa lên lịch",
      target: "Đích build",
      staticBuild: "Snapshot bản tĩnh",
      liveLocal: "Ứng dụng local đang chạy",
    },
    controls: {
      eyebrow: "Điều khiển",
      title: "Điều Khiển Snapshot",
      description:
        "Chọn ngày, lọc danh sách đội, đổi chế độ tô màu, và xuất nhanh giao diện hiện tại trước khi đi sâu vào đội đã chọn.",
      snapshotDate: "Ngày snapshot",
      prev: "Lùi",
      next: "Tiếp",
      today: "Hôm nay",
      futureDatesNote: "Ngày tương lai sẽ bị khóa. Hôm nay được làm nổi bật khi chọn.",
      confederation: "Liên đoàn",
      allConfederations: "Tất cả liên đoàn",
      group: "Bảng",
      allGroups: "Tất cả bảng",
      scope: "Phạm vi",
      allTeams: "Toàn bộ 48 đội",
      top10: "Top 10 đội",
      top20: "Top 20 đội",
      team: "Đội",
      normalizedMode: "Tô màu theo xác suất chuẩn hóa",
      fifaMode: "Tô màu theo hạng FIFA",
      downloadCsv: "Tải CSV",
      downloadPng: "Tải ảnh PNG",
    },
    sections: {
      matchCentreEyebrow: "Trung tâm trận đấu",
      matchCentreTitle: "Lịch đấu, kết quả và bối cảnh bảng",
      matchCentreDescription:
        "Nhịp giải đấu được gom tại đây để lịch đấu sắp tới, trận đã xong, vị trí bảng và lịch của đội đang chọn nằm trong cùng một luồng theo dõi.",
      teamFocusEyebrow: "Trọng tâm đội",
      teamFocusTitle: "Đội được chọn và phần so sánh",
      teamFocusDescription:
        "Đội được chọn trở thành trung tâm của dashboard, còn phong độ gần đây và công cụ so sánh được gom gọn để trang nhìn mạch lạc hơn.",
      analyticsEyebrow: "Phân tích",
      analyticsTitle: "Xu hướng và phân rã xác suất",
      analyticsDescription:
        "Biến động lịch sử, thứ tự ứng viên và toàn bộ trường đội đã lọc được xếp bên dưới bản đồ để luồng đọc chuyển tự nhiên từ tổng quan sang phân tích sâu hơn.",
      methodologyEyebrow: "Phương pháp",
      methodologyTitle: "Mô hình nâng cấp hoạt động như thế nào",
    },
    schedule: {
      upcomingEyebrow: "Trận sắp diễn ra",
      upcomingTitle: "Nhịp Lịch Thi Đấu Giải Đấu",
      upcomingDescription:
        "Lịch vòng bảng nay được chia theo từng ngày thi đấu, và giờ bóng lăn sẽ tự đổi theo múi giờ của người xem.",
      groupStage: "Vòng bảng",
      completedEyebrow: "Trận đã hoàn tất",
      completedTitle: "Các Trận Vừa Kết Thúc",
      completedDescription:
        "Bảng kết quả này bổ sung bối cảnh thực tế cho biến động xác suất vô địch, giúp snapshot gắn hơn với diễn biến trên sân.",
      recentEyebrow: "Kết quả gần đây",
      recentDescription:
        "Các trận vừa hoàn tất gần nhất của đội đang chọn, được làm nổi bật để dễ nối phong độ với biến động xác suất.",
      selectedScheduleEyebrow: "Lịch đội được chọn",
      selectedScheduleDescription:
        "Bảng này theo dõi đủ 3 trận vòng bảng chính thức của đội đang chọn, với giờ thi đấu hiển thị theo múi giờ người xem.",
      matchCalendar: "Lịch Thi Đấu",
      yourLocalTime: "Giờ địa phương của bạn",
      group: "Bảng",
      matchday: "Lượt đấu",
      final: "Chung cuộc",
      noCompleted: "Chưa có trận nào hoàn tất ở snapshot đang chọn.",
      noRecentPrefix: "",
      noRecentSuffix: "chưa hoàn tất trận nào tại thời điểm snapshot này.",
      status: {
        completed: "đã xong",
        today: "hôm nay",
        upcoming: "sắp diễn ra",
      },
    },
    groupStandings: {
      eyebrow: "Bảng xếp hạng bảng",
      title: "Ảnh Chụp Bảng Xếp Hạng Theo Bảng",
      description:
        "Mỗi bảng cập nhật từ các trận đã sinh cho snapshot đang chọn. Phong độ hiển thị chuỗi thắng, hòa, thua gần nhất của từng đội.",
      standings: "Xếp hạng",
      ptsForm: "Điểm / Form",
      team: "Đội",
      noResults: "Chưa có kết quả",
    },
    selectedTeam: {
      summaryEyebrow: "Đội được chọn",
      stageEyebrow: "Bảng các vòng",
      stageTitle: "Lộ Trình Ước Tính Qua Giải",
      stageDescription:
        "Xác suất đi tiếp từ vòng bảng lấy trực tiếp từ odds thị trường. Các vòng sau được mô hình hóa từ odds vô địch để toàn bộ lộ trình nhất quán.",
      group: "Bảng",
      confederation: "Liên đoàn",
      bookmakerOdds: "Odds vô địch từ nhà cái",
      advanceOdds: "Odds qua vòng bảng",
      normalizedProbability: "Xác suất vô địch chuẩn hóa",
      fifaRanking: "Hạng FIFA",
      snapshotDate: "Ngày snapshot",
      notAvailable: "Không có",
      stage: "Vòng",
      probability: "Xác suất",
      stageLabels: {
        roundOf32: "Vào vòng 32 đội",
        roundOf16: "Vào vòng 16 đội",
        quarterfinal: "Vào tứ kết",
        semifinal: "Vào bán kết",
        final: "Vào chung kết",
        champion: "Vô địch",
      },
    },
    comparison: {
      snapshotEyebrow: "So sánh snapshot",
      snapshotTitle: "So với snapshot trước đó",
      snapshotDescription: "Phần này so sánh đội đang chọn ở ngày",
      previousSnapshot: "Snapshot trước",
      noPreviousSnapshot: "Chưa có snapshot trước đó",
      titleProbability: "Xác suất vô địch",
      advanceProbability: "Xác suất qua bảng",
      bookmakerOdds: "Odds vô địch",
      fifaRanking: "Hạng FIFA",
      comparisonEyebrow: "So sánh đội",
      comparisonTitle: "So sánh hai đội",
      comparisonTeam: "Đội dùng để so sánh",
      chooseSecondTeam: "Chọn đội thứ hai",
      titleOdds: "Odds vô địch",
      winProbability: "Xác suất vô địch",
      advanceGap: "Chênh lệch qua bảng",
      winProbabilityGap: "Chênh lệch xác suất vô địch",
      headToHeadTitle: "Chênh lệch snapshot giữa hai đội",
      unavailable: "Chưa có snapshot sớm hơn cho ngày đang chọn nên chưa thể so sánh giữa các snapshot.",
    },
    methodology: {
      card1Title: "1. Odds nhà cái dẫn dắt xác suất vô địch",
      card1Body:
        "Thị trường vô địch được chuyển từ American odds sang xác suất ngầm định bằng công thức chuẩn cho odds dương và odds âm.",
      card2Title: "2. Chuẩn hóa về 100%",
      card2Body:
        "Toàn bộ xác suất vô địch ngầm định được chuẩn hóa để tổng của 48 đội bằng đúng 100%, giúp so sánh song song rõ ràng hơn.",
      card3Title: "3. Lưu snapshot mỗi ngày",
      card3Body:
        "Mỗi lần làm mới hằng ngày sẽ thêm mới hoặc thay thế ngày đã chọn trong file lịch sử, từ đó vận hành bộ chọn ngày và biểu đồ xu hướng.",
      card4Title: "4. Mô hình hóa đường đi qua các vòng",
      card4Body:
        "Odds qua vòng bảng lấy trực tiếp từ giá thị trường. Xác suất các vòng knock-out sau đó được ước tính từ mối quan hệ giữa khả năng qua bảng và xác suất vô địch.",
      footer:
        "Xếp hạng FIFA chỉ mang tính ngữ cảnh. Bản đồ có thể chuyển sang chế độ tô màu theo xếp hạng, nhưng thứ tự chính và logic xu hướng lịch sử vẫn dựa trên snapshot xác suất vô địch từ nhà cái.",
    },
    counter: {
      previewLabel: "Bộ đếm xem thử",
      pageViewsLabel: "Lượt xem",
      localViews: "Lượt xem local",
      pageViews: "Lượt xem",
      previewMessage: "Bộ đếm xem thử khi chạy local.",
      loading: "Đang tải lượt xem...",
      unavailable: "Hiện chưa lấy được lượt xem.",
    },
    language: {
      label: "Ngôn ngữ",
    },
    seo: {
      title: "Bản Đồ Xác Suất Vô Địch World Cup 2026",
      description:
        "Bảng điều khiển World Cup 2026 tương tác với odds nhà cái, bản đồ xác suất, lịch thi đấu, bảng xếp hạng, so sánh đội và lịch sử snapshot hằng ngày.",
      keywords:
        "World Cup 2026, xác suất vô địch World Cup 2026, odds World Cup, bản đồ xác suất World Cup, phân tích bóng đá, lịch World Cup 2026, bảng xếp hạng World Cup",
    },
  },
  fr: {
    languageName: "Français",
    nav: {
      matchCentre: "Centre des matchs",
      groupStandings: "Classements",
      teamFocus: "Focus équipe",
      analytics: "Analyses",
    },
    header: {
      eyebrow: "Application de snapshot quotidien",
      title: "Carte des Probabilités de Victoire Coupe du Monde 2026",
      description:
        "Un tableau de bord Coupe du Monde guidé par les cotes des bookmakers, avec historique quotidien, sélection sur la carte, probabilités par tour et fichiers prêts pour l'automatisation des 48 équipes qualifiées.",
      lastSnapshot: "Dernier snapshot",
      teamsSuffix: "équipes",
      loading: "Chargement de l'historique...",
      noData: "Aucune donnée de snapshot disponible pour le moment.",
    },
    summary: {
      favorite: "Favori",
      averageProbability: "Probabilité moyenne",
      averageDetail: "Normalisée sur l'ensemble des 48 équipes",
      highestRanked: "Équipe la mieux classée",
      fifaRank: "Rang FIFA",
      marketSource: "Source du marché",
      snapshotDate: "Date du snapshot",
      notAvailable: "N/A",
    },
    automation: {
      eyebrow: "Statut de mise à jour quotidienne",
      lastAutoUpdate: "Dernière mise à jour auto",
      nextScheduledUpdate: "Prochaine mise à jour prévue",
      dataSourceStatus: "Statut de la source",
      runMode: "Mode d'exécution",
      notScheduled: "Pas encore planifiée",
      target: "Cible",
      staticBuild: "Snapshot statique",
      liveLocal: "Application locale active",
    },
    controls: {
      eyebrow: "Contrôles",
      title: "Contrôles du Snapshot",
      description:
        "Choisissez la date, filtrez le plateau, changez le mode couleur et exportez la vue actuelle avant d'explorer l'équipe sélectionnée.",
      snapshotDate: "Date du snapshot",
      prev: "Préc.",
      next: "Suiv.",
      today: "Aujourd'hui",
      futureDatesNote: "Les dates futures restent désactivées. Aujourd'hui est mis en avant lorsqu'il est sélectionné.",
      confederation: "Confédération",
      allConfederations: "Toutes les confédérations",
      group: "Groupe",
      allGroups: "Tous les groupes",
      scope: "Portée",
      allTeams: "Toutes les 48 équipes",
      top10: "Top 10 équipes",
      top20: "Top 20 équipes",
      team: "Équipe",
      normalizedMode: "Colorer par probabilité normalisée",
      fifaMode: "Colorer par rang FIFA",
      downloadCsv: "Télécharger CSV",
      downloadPng: "Télécharger capture PNG",
    },
    sections: {
      matchCentreEyebrow: "Centre des matchs",
      matchCentreTitle: "Calendrier, résultats et contexte des groupes",
      matchCentreDescription:
        "Le fil du tournoi est regroupé ici afin que les matchs à venir, les résultats, la position dans le groupe et le calendrier de l'équipe sélectionnée se lisent dans une seule séquence.",
      teamFocusEyebrow: "Focus équipe",
      teamFocusTitle: "Vue équipe sélectionnée et comparaison",
      teamFocusDescription:
        "L'équipe sélectionnée devient le centre du tableau de bord, tandis que la forme récente et les outils de comparaison sont regroupés plus proprement.",
      analyticsEyebrow: "Analyses",
      analyticsTitle: "Tendances et décomposition des probabilités",
      analyticsDescription:
        "Les mouvements historiques, l'ordre des favoris et tout le plateau filtré sont regroupés sous la carte pour faire progresser la lecture du général au détail.",
      methodologyEyebrow: "Méthodologie",
      methodologyTitle: "Comment fonctionne le modèle amélioré",
    },
    schedule: {
      upcomingEyebrow: "Matchs à venir",
      upcomingTitle: "Pouls du calendrier du tournoi",
      upcomingDescription:
        "Les matches de groupes sont maintenant regroupés par jour, avec des horaires de coup d'envoi automatiquement convertis dans le fuseau horaire du visiteur.",
      groupStage: "Phase de groupes",
      completedEyebrow: "Matchs terminés",
      completedTitle: "Matchs récemment terminés",
      completedDescription:
        "Ce tableau de résultats apporte un contexte récent aux variations de probabilité de titre et relie mieux le snapshot au terrain.",
      recentEyebrow: "Résultats récents",
      recentDescription:
        "Les derniers matchs terminés de l'équipe sélectionnée, mis en évidence pour mieux relier la forme récente aux mouvements de probabilité.",
      selectedScheduleEyebrow: "Calendrier de l'équipe sélectionnée",
      selectedScheduleDescription:
        "Ce panneau suit les trois matchs officiels de groupe de l'équipe sélectionnée, avec des horaires adaptés au fuseau horaire du visiteur.",
      matchCalendar: "Calendrier",
      yourLocalTime: "Votre heure locale",
      group: "Groupe",
      matchday: "Journée",
      final: "Final",
      noCompleted: "Aucun match n'est encore terminé à cette date de snapshot.",
      noRecentPrefix: "",
      noRecentSuffix: "n'a encore terminé aucun match à cette date de snapshot.",
      status: {
        completed: "terminé",
        today: "aujourd'hui",
        upcoming: "à venir",
      },
    },
    groupStandings: {
      eyebrow: "Classements des groupes",
      title: "Instantané des classements de groupe",
      description:
        "Chaque tableau se met à jour à partir des matchs terminés générés pour la date de snapshot choisie. La forme affiche la suite récente victoire, nul, défaite.",
      standings: "Classement",
      ptsForm: "Pts / Forme",
      team: "Équipe",
      noResults: "Pas encore de résultats",
    },
    selectedTeam: {
      summaryEyebrow: "Équipe sélectionnée",
      stageEyebrow: "Tableau des tours",
      stageTitle: "Chemin estimé dans le tournoi",
      stageDescription:
        "La qualification depuis les groupes utilise directement les cotes du marché. Les tours suivants sont modélisés à partir des cotes de titre pour garder une cohérence globale.",
      group: "Groupe",
      confederation: "Confédération",
      bookmakerOdds: "Cotes titre bookmaker",
      advanceOdds: "Cotes de qualification",
      normalizedProbability: "Probabilité de titre normalisée",
      fifaRanking: "Classement FIFA",
      snapshotDate: "Date du snapshot",
      notAvailable: "N/A",
      stage: "Tour",
      probability: "Probabilité",
      stageLabels: {
        roundOf32: "Atteindre les 32es",
        roundOf16: "Atteindre les 8es",
        quarterfinal: "Atteindre les quarts",
        semifinal: "Atteindre les demies",
        final: "Atteindre la finale",
        champion: "Remporter le tournoi",
      },
    },
    comparison: {
      snapshotEyebrow: "Comparaison de snapshot",
      snapshotTitle: "Comparer avec le snapshot précédent",
      snapshotDescription: "Cette section compare l'équipe sélectionnée à la date",
      previousSnapshot: "Snapshot précédent",
      noPreviousSnapshot: "Aucun snapshot précédent disponible",
      titleProbability: "Probabilité de titre",
      advanceProbability: "Qualification depuis le groupe",
      bookmakerOdds: "Cotes bookmaker",
      fifaRanking: "Classement FIFA",
      comparisonEyebrow: "Comparaison d'équipes",
      comparisonTitle: "Comparer deux équipes",
      comparisonTeam: "Équipe de comparaison",
      chooseSecondTeam: "Choisir une deuxième équipe",
      titleOdds: "Cotes titre",
      winProbability: "Probabilité de victoire",
      advanceGap: "Écart de qualification",
      winProbabilityGap: "Écart de probabilité de victoire",
      headToHeadTitle: "Écart instantané entre les deux équipes",
      unavailable: "Il n'existe pas encore de snapshot antérieur pour cette date sélectionnée, donc la comparaison entre snapshots est indisponible.",
    },
    methodology: {
      card1Title: "1. Les cotes guident les chances de titre",
      card1Body:
        "Les marchés de titre sont convertis des American odds vers une probabilité implicite grâce aux formules standards pour cotes positives et négatives.",
      card2Title: "2. Normaliser à 100 %",
      card2Body:
        "Toutes les probabilités implicites de titre sont normalisées afin que l'ensemble des 48 équipes totalise exactement 100 %, ce qui rend les comparaisons plus nettes.",
      card3Title: "3. Sauvegarder un snapshot quotidien",
      card3Body:
        "Chaque rafraîchissement quotidien ajoute ou remplace la date sélectionnée dans le fichier historique, lequel alimente le sélecteur de date et le graphique de tendance.",
      card4Title: "4. Modéliser la progression",
      card4Body:
        "Les chances de sortie de groupe viennent directement du marché. Les probabilités des tours suivants sont ensuite estimées à partir du lien entre qualification et chances de titre.",
      footer:
        "Le classement FIFA reste purement contextuel. La carte peut aussi passer en mode couleur basé sur le classement, mais la hiérarchie principale et la logique historique reposent sur les probabilités de titre dérivées des bookmakers.",
    },
    counter: {
      previewLabel: "Compteur aperçu",
      pageViewsLabel: "Vues",
      localViews: "Vues locales",
      pageViews: "Vues de page",
      previewMessage: "Compteur d'aperçu en exécution locale.",
      loading: "Chargement du compteur...",
      unavailable: "Le compteur est indisponible pour le moment.",
    },
    language: {
      label: "Langue",
    },
    seo: {
      title: "Carte des Probabilités de Victoire Coupe du Monde 2026",
      description:
        "Tableau de bord interactif Coupe du Monde 2026 avec cotes bookmakers, carte mondiale, comparaison d'équipes, classements de groupes, calendrier et historique quotidien.",
      keywords:
        "Coupe du Monde 2026, probabilité Coupe du Monde 2026, cotes Coupe du Monde, carte de probabilité, analyse football, calendrier Coupe du Monde, classements des groupes",
    },
  },
  es: {
    languageName: "Español",
    nav: {
      matchCentre: "Centro de partidos",
      groupStandings: "Clasificación",
      teamFocus: "Enfoque de equipo",
      analytics: "Analítica",
    },
    header: {
      eyebrow: "App de snapshot diario",
      title: "Mapa de Probabilidad de Ganar el Mundial 2026",
      description:
        "Un panel del Mundial guiado por cuotas de casas de apuestas, con historial diario, selección en mapa, probabilidades por fase y archivos listos para automatización para las 48 selecciones clasificadas.",
      lastSnapshot: "Último snapshot",
      teamsSuffix: "equipos",
      loading: "Cargando historial...",
      noData: "Todavía no hay datos de snapshot disponibles.",
    },
    summary: {
      favorite: "Favorito",
      averageProbability: "Probabilidad media",
      averageDetail: "Normalizada sobre las 48 selecciones",
      highestRanked: "Equipo mejor clasificado",
      fifaRank: "Ranking FIFA",
      marketSource: "Fuente del mercado",
      snapshotDate: "Fecha del snapshot",
      notAvailable: "N/D",
    },
    automation: {
      eyebrow: "Estado de actualización diaria",
      lastAutoUpdate: "Última actualización automática",
      nextScheduledUpdate: "Próxima actualización programada",
      dataSourceStatus: "Estado de la fuente de datos",
      runMode: "Modo de ejecución",
      notScheduled: "Aún no programado",
      target: "Destino",
      staticBuild: "Snapshot estático",
      liveLocal: "App local activa",
    },
    controls: {
      eyebrow: "Controles",
      title: "Controles del Snapshot",
      description:
        "Elige la fecha, filtra el cuadro, cambia el modo de color y exporta la vista actual antes de entrar al detalle del equipo seleccionado.",
      snapshotDate: "Fecha del snapshot",
      prev: "Prev",
      next: "Sig",
      today: "Hoy",
      futureDatesNote: "Las fechas futuras quedan desactivadas. Hoy se resalta cuando está seleccionado.",
      confederation: "Confederación",
      allConfederations: "Todas las confederaciones",
      group: "Grupo",
      allGroups: "Todos los grupos",
      scope: "Alcance",
      allTeams: "Los 48 equipos",
      top10: "Top 10 equipos",
      top20: "Top 20 equipos",
      team: "Equipo",
      normalizedMode: "Color por probabilidad normalizada",
      fifaMode: "Color por ranking FIFA",
      downloadCsv: "Descargar CSV",
      downloadPng: "Descargar captura PNG",
    },
    sections: {
      matchCentreEyebrow: "Centro de partidos",
      matchCentreTitle: "Calendario, resultados y contexto de grupos",
      matchCentreDescription:
        "El flujo del torneo se agrupa aquí para que próximos partidos, encuentros terminados, posición en la tabla y calendario del equipo seleccionado se lean en una sola secuencia.",
      teamFocusEyebrow: "Enfoque de equipo",
      teamFocusTitle: "Vista del equipo seleccionado y comparación",
      teamFocusDescription:
        "El equipo seleccionado ahora ancla el centro del panel, mientras la forma reciente y las herramientas de comparación quedan agrupadas con más claridad.",
      analyticsEyebrow: "Analítica",
      analyticsTitle: "Tendencias y desglose de probabilidad",
      analyticsDescription:
        "El movimiento histórico, el orden de favoritos y todo el campo filtrado se agrupan debajo del mapa para pasar de la vista general al análisis profundo.",
      methodologyEyebrow: "Metodología",
      methodologyTitle: "Cómo funciona el modelo mejorado",
    },
    schedule: {
      upcomingEyebrow: "Próximos partidos",
      upcomingTitle: "Pulso del calendario del torneo",
      upcomingDescription:
        "Los partidos de la fase de grupos ahora se agrupan por día, mientras que el horario de inicio se ajusta automáticamente a la zona horaria del visitante.",
      groupStage: "Fase de grupos",
      completedEyebrow: "Partidos completados",
      completedTitle: "Partidos completados recientemente",
      completedDescription:
        "Este tablero de resultados añade contexto reciente a los cambios en la probabilidad de título y conecta mejor el snapshot con lo ocurrido en cancha.",
      recentEyebrow: "Resultados recientes",
      recentDescription:
        "Los partidos más recientes del equipo seleccionado, destacados para relacionar mejor la forma reciente con el movimiento de probabilidades.",
      selectedScheduleEyebrow: "Calendario del equipo seleccionado",
      selectedScheduleDescription:
        "Este panel sigue los tres partidos oficiales de grupos del equipo seleccionado, con horarios ajustados a la zona horaria del visitante.",
      matchCalendar: "Calendario",
      yourLocalTime: "Tu hora local",
      group: "Grupo",
      matchday: "Jornada",
      final: "Final",
      noCompleted: "Todavía no hay partidos completados para la fecha de snapshot seleccionada.",
      noRecentPrefix: "",
      noRecentSuffix: "todavía no ha completado un partido en esta fecha de snapshot.",
      status: {
        completed: "completado",
        today: "hoy",
        upcoming: "próximo",
      },
    },
    groupStandings: {
      eyebrow: "Clasificación de grupos",
      title: "Instantánea de la tabla de grupos",
      description:
        "Cada tabla se actualiza a partir de los partidos completados generados para la fecha de snapshot seleccionada. La forma muestra una secuencia simple de victoria, empate y derrota.",
      standings: "Posiciones",
      ptsForm: "Pts / Forma",
      team: "Equipo",
      noResults: "Sin resultados todavía",
    },
    selectedTeam: {
      summaryEyebrow: "Equipo seleccionado",
      stageEyebrow: "Tabla de fases",
      stageTitle: "Camino estimado en el torneo",
      stageDescription:
        "El avance desde grupos usa directamente las cuotas del mercado. Las rondas posteriores se modelan a partir de las cuotas al título para mantener coherencia interna.",
      group: "Grupo",
      confederation: "Confederación",
      bookmakerOdds: "Cuotas al título",
      advanceOdds: "Cuotas para avanzar",
      normalizedProbability: "Probabilidad de título normalizada",
      fifaRanking: "Ranking FIFA",
      snapshotDate: "Fecha del snapshot",
      notAvailable: "N/D",
      stage: "Fase",
      probability: "Probabilidad",
      stageLabels: {
        roundOf32: "Llegar a dieciseisavos",
        roundOf16: "Llegar a octavos",
        quarterfinal: "Llegar a cuartos",
        semifinal: "Llegar a semifinales",
        final: "Llegar a la final",
        champion: "Ganar el torneo",
      },
    },
    comparison: {
      snapshotEyebrow: "Comparación de snapshot",
      snapshotTitle: "Comparar con el snapshot anterior",
      snapshotDescription: "Esto compara al equipo seleccionado en la fecha",
      previousSnapshot: "Snapshot anterior",
      noPreviousSnapshot: "No hay snapshot anterior disponible",
      titleProbability: "Probabilidad de título",
      advanceProbability: "Probabilidad de avanzar",
      bookmakerOdds: "Cuotas al título",
      fifaRanking: "Ranking FIFA",
      comparisonEyebrow: "Comparación de equipos",
      comparisonTitle: "Comparar dos equipos",
      comparisonTeam: "Equipo de comparación",
      chooseSecondTeam: "Elige un segundo equipo",
      titleOdds: "Cuotas al título",
      winProbability: "Probabilidad de ganar",
      advanceGap: "Diferencia de avance",
      winProbabilityGap: "Diferencia de probabilidad",
      headToHeadTitle: "Diferencia snapshot cara a cara",
      unavailable: "Todavía no existe un snapshot anterior para esta fecha seleccionada, así que la comparación entre snapshots no está disponible.",
    },
    methodology: {
      card1Title: "1. Las cuotas impulsan las opciones al título",
      card1Body:
        "Los mercados del título se convierten de American odds a probabilidad implícita usando las fórmulas estándar para cuotas positivas y negativas.",
      card2Title: "2. Normalizar al 100%",
      card2Body:
        "Todas las probabilidades implícitas al título se normalizan para que el campo completo de 48 selecciones sume exactamente 100%, lo que mejora las comparaciones.",
      card3Title: "3. Guardar un snapshot diario",
      card3Body:
        "Cada actualización diaria agrega o reemplaza la fecha seleccionada en el archivo histórico, que alimenta el selector de fecha y el gráfico de tendencia.",
      card4Title: "4. Modelar la progresión por fases",
      card4Body:
        "Las cuotas para avanzar desde grupos vienen directamente del mercado. Las probabilidades de rondas posteriores se estiman a partir de la relación entre avanzar y ganar el torneo.",
      footer:
        "El ranking FIFA sigue siendo solo contextual. El mapa también puede cambiar a un modo de color por ranking, pero la jerarquía principal y la lógica histórica se basan en snapshots de probabilidad al título derivados de casas de apuestas.",
    },
    counter: {
      previewLabel: "Contador preview",
      pageViewsLabel: "Visitas",
      localViews: "Visitas locales",
      pageViews: "Visitas",
      previewMessage: "Contador de prueba al ejecutar localmente.",
      loading: "Cargando visitas...",
      unavailable: "Las visitas no están disponibles ahora mismo.",
    },
    language: {
      label: "Idioma",
    },
    seo: {
      title: "Mapa de Probabilidad de Ganar el Mundial 2026",
      description:
        "Panel interactivo del Mundial 2026 con cuotas de casas de apuestas, mapa global, comparación de equipos, tablas de grupo, calendario e historial diario.",
      keywords:
        "Mundial 2026, probabilidad Mundial 2026, cuotas Mundial, mapa de probabilidad, analítica de fútbol, calendario Mundial 2026, tabla de grupos",
    },
  },
};
