/* eslint-disable react-refresh/only-export-components */
import {
  ITEM_TYPE_OPTIONS,
  RecommendationCell,
  ReportTable,
  SelectControl,
  appendPeriodParams,
  createDefaultPeriodFilters,
  formatDate,
  formatDecimal,
  formatNumber,
  formatPercent,
  renderPopularityIdentityCell,
} from "./reportShared";

export const popularityReportPage = {
  key: "popularity",
  label: "Popularity",
  description:
    "Identify high-demand titles, inventory pressure, and items that may need more copies.",
  endpoint: "/api/reports/popularity",
  defaultSort: "times_checked_out",
  createInitialFilters() {
    return {
      itemType: "All",
      ...createDefaultPeriodFilters(),
    };
  },
  buildParams(params, filters) {
    appendPeriodParams(params, filters);
    if (filters.itemType !== "All") {
      params.set("type", filters.itemType);
    }
  },
};

export function PopularityReportsFilters({ filters, onChange }) {
  return (
    <SelectControl
      label="Item Type"
      value={filters.itemType}
      onChange={(value) => onChange("itemType", value)}
      options={ITEM_TYPE_OPTIONS}
    />
  );
}

export function PopularityReportsTable({
  data,
  periodLabel,
  sort,
  sortDirection,
  onSortChange,
}) {
  const columns = getPopularityColumns(periodLabel);

  return (
    <ReportTable
      reportType="popularity"
      sort={sort}
      sortDirection={sortDirection}
      data={data}
      columns={columns}
      onSortChange={onSortChange}
    />
  );
}

function getPopularityColumns(periodLabel) {
  return [
    {
      key: "item_name",
      label: "Item",
      sortable: false,
      render: renderPopularityIdentityCell,
    },
    {
      key: "times_checked_out",
      label: `Checkouts (${periodLabel})`,
      render: (item) => formatNumber(item.times_checked_out),
    },
    {
      key: "borrowing_rate",
      label: `Borrow Rate (${periodLabel})`,
      render: (item) => formatDecimal(item.borrowing_rate),
    },
    {
      key: "utilization_rate",
      label: `Utilization (${periodLabel})`,
      render: (item) => formatPercent(item.utilization_rate),
    },
    {
      key: "demand_ratio",
      label: `Demand Ratio (${periodLabel})`,
      render: (item) => formatDecimal(item.demand_ratio),
    },
    {
      key: "active_holds",
      label: `Holds (${periodLabel})`,
      render: (item) => formatNumber(item.active_holds),
    },
    {
      key: "unique_borrowers",
      label: `Unique Borrowers (${periodLabel})`,
      render: (item) => formatNumber(item.unique_borrowers),
    },
    {
      key: "num_copies",
      label: "Copies Owned",
      render: (item) => formatNumber(item.num_copies),
    },
    {
      key: "available_copies",
      label: "Available Now",
      render: (item) => formatNumber(item.available_copies),
    },
    {
      key: "checked_out_copies",
      label: "Checked Out Now",
      render: (item) => formatNumber(item.checked_out_copies),
    },
    {
      key: "last_borrow_date",
      label: `Last Borrowed (${periodLabel})`,
      render: (item) => formatDate(item.last_borrow_date),
    },
    {
      key: "recommended_additional_copies",
      label: "Stock Recommendation",
      render: (item) => <RecommendationCell item={item} />,
    },
  ];
}
