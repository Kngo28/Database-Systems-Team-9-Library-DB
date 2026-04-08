/* eslint-disable react-refresh/only-export-components */
import {
  CheckboxControl,
  InputControl,
  ROLE_OPTIONS,
  ReportTable,
  SelectControl,
  appendPeriodParams,
  createDefaultPeriodFilters,
  formatAccountStatus,
  formatBorrowStatus,
  formatDate,
  formatDecimal,
  formatMoney,
  formatNumber,
  formatRole,
  renderPatronIdentityCell,
} from "./reportShared";

export const patronActivityReportPage = {
  key: "patrons",
  label: "Patron Activity",
  description:
    "Measure engagement, recency, and account risk across your patron base.",
  endpoint: "/api/reports/patrons",
  defaultSort: "borrow_count",
  createInitialFilters() {
    return {
      ...createDefaultPeriodFilters(),
      role: "All",
      minBorrows: "",
      withUnpaidOnly: false,
    };
  },
  buildParams(params, filters) {
    appendPeriodParams(params, filters);
    if (filters.role !== "All") params.set("role", filters.role);
    if (filters.minBorrows !== "") params.set("minBorrows", filters.minBorrows);
    if (filters.withUnpaidOnly) params.set("withUnpaidOnly", "true");
  },
};

export function PatronActivityReportsFilters({ filters, onChange }) {
  return (
    <>
      <SelectControl
        label="Patron Type"
        value={filters.role}
        onChange={(value) => onChange("role", value)}
        options={ROLE_OPTIONS}
      />
      <InputControl
        label="Min Borrows in Period"
        type="number"
        min={0}
        value={filters.minBorrows}
        onChange={(value) => onChange("minBorrows", value)}
      />
      <CheckboxControl
        label="Only Show Accounts With Debt"
        checked={filters.withUnpaidOnly}
        onChange={(value) => onChange("withUnpaidOnly", value)}
      />
    </>
  );
}

export function PatronActivityReportsTable({
  data,
  periodLabel,
  sort,
  sortDirection,
  onSortChange,
}) {
  const columns = getPatronActivityColumns(periodLabel);

  return (
    <ReportTable
      reportType="patrons"
      sort={sort}
      sortDirection={sortDirection}
      data={data}
      columns={columns}
      onSortChange={onSortChange}
    />
  );
}

function getPatronActivityColumns(periodLabel) {
  return [
    {
      key: "patron",
      label: "Patron",
      sortable: false,
      render: renderPatronIdentityCell,
    },
    { key: "role", label: "Role", render: (item) => formatRole(item.role) },
    {
      key: "account_status",
      label: "Account Status",
      render: (item) => formatAccountStatus(item.account_status),
    },
    {
      key: "borrow_status",
      label: "Borrow Status",
      render: (item) => formatBorrowStatus(item.borrow_status),
    },
    {
      key: "borrow_count",
      label: `Borrows (${periodLabel})`,
      render: (item) => formatNumber(item.borrow_count),
    },
    {
      key: "borrow_rate",
      label: `Borrow Rate (${periodLabel})`,
      render: (item) => formatDecimal(item.borrow_rate),
    },
    {
      key: "unique_titles_borrowed",
      label: `Unique Titles (${periodLabel})`,
      render: (item) => formatNumber(item.unique_titles_borrowed),
    },
    {
      key: "active_holds",
      label: `Active Holds (${periodLabel})`,
      render: (item) => formatNumber(item.active_holds),
    },
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
      key: "patrons_months",
      label: "Patron Months",
      render: (item) => formatNumber(item.patrons_months),
    },
    {
      key: "days_since_last_borrow",
      label: `Days Since Last Borrow (${periodLabel})`,
      render: (item) =>
        item.days_since_last_borrow == null
          ? "Never"
          : `${formatNumber(item.days_since_last_borrow)} days`,
    },
    {
      key: "last_borrow_date",
      label: `Last Borrowed (${periodLabel})`,
      render: (item) => formatDate(item.last_borrow_date),
    },
  ];
}
