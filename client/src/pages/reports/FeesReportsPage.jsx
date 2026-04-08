/* eslint-disable react-refresh/only-export-components */
import {
  InputControl,
  ROLE_OPTIONS,
  ReportTable,
  SelectControl,
  appendPeriodParams,
  createDefaultPeriodFilters,
  formatDate,
  formatDecimal,
  formatMoney,
  formatNumber,
  formatRole,
  renderPatronIdentityCell,
} from "./reportShared";

export const feesReportPage = {
  key: "fees",
  label: "Unpaid Fees",
  description:
    "Spot high-risk accounts by balance, fee count, and how long unpaid debt has been sitting.",
  endpoint: "/api/reports/fees",
  defaultSort: "unpaid_total",
  createInitialFilters() {
    return {
      ...createDefaultPeriodFilters(),
      role: "All",
      minTotal: "",
      minFeeCount: "",
      minDaysOutstanding: "",
    };
  },
  buildParams(params, filters) {
    appendPeriodParams(params, filters);
    if (filters.role !== "All") params.set("role", filters.role);
    if (filters.minTotal !== "") params.set("minTotal", filters.minTotal);
    if (filters.minFeeCount !== "") params.set("minFeeCount", filters.minFeeCount);
    if (filters.minDaysOutstanding !== "") {
      params.set("minDaysOutstanding", filters.minDaysOutstanding);
    }
  },
};

export function FeesReportsFilters({ filters, onChange }) {
  return (
    <>
      <SelectControl
        label="Patron Type"
        value={filters.role}
        onChange={(value) => onChange("role", value)}
        options={ROLE_OPTIONS}
      />
      <InputControl
        label="Min Balance"
        type="number"
        min={0}
        step="0.01"
        value={filters.minTotal}
        onChange={(value) => onChange("minTotal", value)}
      />
      <InputControl
        label="Min Fee Count"
        type="number"
        min={0}
        value={filters.minFeeCount}
        onChange={(value) => onChange("minFeeCount", value)}
      />
      <InputControl
        label="Min Debt Age (Days)"
        type="number"
        min={0}
        value={filters.minDaysOutstanding}
        onChange={(value) => onChange("minDaysOutstanding", value)}
      />
    </>
  );
}

export function FeesReportsTable({
  data,
  periodLabel,
  sort,
  sortDirection,
  onSortChange,
}) {
  const columns = getFeesColumns(periodLabel);

  return (
    <ReportTable
      reportType="fees"
      sort={sort}
      sortDirection={sortDirection}
      data={data}
      columns={columns}
      onSortChange={onSortChange}
    />
  );
}

function getFeesColumns(periodLabel) {
  return [
    {
      key: "patron",
      label: "Patron",
      sortable: false,
      render: renderPatronIdentityCell,
    },
    { key: "role", label: "Role", render: (item) => formatRole(item.role) },
    {
      key: "unpaid_total",
      label: `Unpaid Total (${periodLabel})`,
      render: (item) => formatMoney(item.unpaid_total),
    },
    {
      key: "unpaid_fee_count",
      label: `Unpaid Fees (${periodLabel})`,
      render: (item) => formatNumber(item.unpaid_fee_count),
    },
    {
      key: "overdue_item_count",
      label: `Affected Items (${periodLabel})`,
      render: (item) => formatNumber(item.overdue_item_count),
    },
    {
      key: "avg_fee_amount",
      label: `Avg Fee (${periodLabel})`,
      render: (item) => formatMoney(item.avg_fee_amount),
    },
    {
      key: "largest_fee_amount",
      label: `Largest Fee (${periodLabel})`,
      render: (item) => formatMoney(item.largest_fee_amount),
    },
    {
      key: "max_days_outstanding",
      label: `Oldest Debt Age (${periodLabel})`,
      render: (item) => `${formatNumber(item.max_days_outstanding)} days`,
    },
    {
      key: "avg_days_outstanding",
      label: `Avg Debt Age (${periodLabel})`,
      render: (item) => `${formatDecimal(item.avg_days_outstanding)} days`,
    },
    {
      key: "oldest_unpaid_date",
      label: `Oldest Debt Date (${periodLabel})`,
      render: (item) => formatDate(item.oldest_unpaid_date),
    },
  ];
}
