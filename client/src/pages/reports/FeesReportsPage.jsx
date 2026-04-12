/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import {
  FEE_STATUS_OPTIONS,
  FEE_TYPE_OPTIONS,
  InputControl,
  ITEM_TYPE_OPTIONS,
  ROLE_OPTIONS,
  ReportTable,
  SelectControl,
  appendPeriodParams,
  createDefaultPeriodFilters,
  formatDate,
  formatFeeStatus,
  formatFeeType,
  formatItemType,
  formatMoney,
  formatNumber,
  formatRole,
} from "./reportShared";

const GROUP_BY_OPTIONS = [
  { label: "No Grouping", value: "none" },
  { label: "By Fee Type", value: "feeType" },
  { label: "By Item Type", value: "itemType" },
  { label: "By Role", value: "role" },
];

const GROUPED_SORTS = ["group_label", "total_amount", "paid_amount", "unpaid_amount", "fee_count", "paid_count", "unpaid_count"];

function groupData(data, groupBy) {
  if (groupBy === "none") return data;

  const groups = {};

  for (const row of data) {
    let key, label;
    if (groupBy === "feeType") {
      key = row.fee_type;
      label = formatFeeType(row.fee_type);
    } else if (groupBy === "itemType") {
      key = row.Item_type;
      label = formatItemType(row.Item_type);
    } else {
      key = row.role;
      label = formatRole(row.role);
    }

    if (!groups[key]) {
      groups[key] = {
        group_key: key,
        group_label: label,
        total_amount: 0,
        paid_amount: 0,
        unpaid_amount: 0,
        fee_count: 0,
        paid_count: 0,
        unpaid_count: 0,
      };
    }

    const g = groups[key];
    g.fee_count++;
    g.total_amount += Number(row.fee_amount ?? 0);
    if (Number(row.fee_status) === 2) {
      g.paid_amount += Number(row.fee_amount ?? 0);
      g.paid_count++;
    } else {
      g.unpaid_amount += Number(row.fee_amount ?? 0);
      g.unpaid_count++;
    }
  }

  return Object.values(groups);
}

function sortGrouped(rows, sort, direction) {
  const mult = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[sort] ?? "";
    const bv = b[sort] ?? "";
    if (typeof av === "string") return av.localeCompare(bv) * mult;
    return (av - bv) * mult;
  });
}

export const feesReportPage = {
  key: "revenue",
  label: "Revenue",
  pdfTitle: "Revenue Report",
  description: "Full fee history with revenue collected, backlog, and breakdown by type, item, or patron.",
  endpoint: "/api/reports/revenue",
  defaultSort: "date_owed",
  createInitialFilters() {
    return {
      ...createDefaultPeriodFilters(),
      role: "All",
      feeType: "All",
      itemType: "All",
      paidStatus: "All",
      groupBy: "none",
    };
  },
  buildParams(params, filters) {
    appendPeriodParams(params, filters);
    if (filters.role !== "All") params.set("role", filters.role);
    if (filters.feeType !== "All") params.set("feeType", filters.feeType);
    if (filters.itemType !== "All") params.set("itemType", filters.itemType);
    if (filters.paidStatus !== "All") params.set("paidStatus", filters.paidStatus);
  },
  getExportSummary(filters) {
    return [
      { label: "Role", value: ROLE_OPTIONS.find((o) => o.value === filters.role)?.label ?? "All" },
      { label: "Fee Type", value: FEE_TYPE_OPTIONS.find((o) => o.value === filters.feeType)?.label ?? "All" },
      { label: "Item Type", value: ITEM_TYPE_OPTIONS.find((o) => o.value === filters.itemType)?.label ?? "All" },
      { label: "Status", value: FEE_STATUS_OPTIONS.find((o) => o.value === filters.paidStatus)?.label ?? "All" },
    ];
  },
};

export function FeesReportsFilters({ filters, onChange }) {
  return (
    <>
      <SelectControl
        label="Fee Type"
        value={filters.feeType}
        onChange={(value) => onChange("feeType", value)}
        options={FEE_TYPE_OPTIONS}
      />
      <SelectControl
        label="Item Type"
        value={filters.itemType}
        onChange={(value) => onChange("itemType", value)}
        options={ITEM_TYPE_OPTIONS}
      />
      <SelectControl
        label="Role"
        value={filters.role}
        onChange={(value) => onChange("role", value)}
        options={ROLE_OPTIONS}
      />
      <SelectControl
        label="Status"
        value={filters.paidStatus}
        onChange={(value) => onChange("paidStatus", value)}
        options={FEE_STATUS_OPTIONS}
      />
      <SelectControl
        label="Group By"
        value={filters.groupBy}
        onChange={(value) => onChange("groupBy", value)}
        options={GROUP_BY_OPTIONS}
      />
    </>
  );
}

export function FeesReportsTable({
  data,
  periodLabel,
  sort,
  sortDirection,
  hiddenColumnKeys,
  onSortChange,
  onColumnVisibilityChange,
  filters,
}) {
  const [groupedSort, setGroupedSort] = useState("total_amount");
  const [groupedDirection, setGroupedDirection] = useState("desc");

  const groupBy = filters?.groupBy ?? "none";

  if (groupBy !== "none") {
    const grouped = sortGrouped(groupData(data, groupBy), groupedSort, groupedDirection);

    function handleGroupedSort(key) {
      if (groupedSort === key) {
        setGroupedDirection((d) => (d === "desc" ? "asc" : "desc"));
      } else {
        setGroupedSort(key);
        setGroupedDirection("desc");
      }
    }

    const groupLabel =
      groupBy === "feeType" ? "Fee Type" : groupBy === "itemType" ? "Item Type" : "Role";

    const groupedColumns = [
      { key: "group_label", label: groupLabel },
      { key: "total_amount", label: `Expected Revenue (${periodLabel})` },
      { key: "paid_amount", label: `Collected (${periodLabel})` },
      { key: "unpaid_amount", label: `Backlog (${periodLabel})` },
      { key: "fee_count", label: "Total Fees" },
      { key: "paid_count", label: "Paid" },
      { key: "unpaid_count", label: "Unpaid" },
    ];

    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                {groupedColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`border border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${
                      groupedSort === col.key ? "bg-green-100 text-green-900" : "text-gray-600"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleGroupedSort(col.key)}
                      className="flex w-full items-center justify-between gap-2 text-left"
                    >
                      <span>{col.label}</span>
                      <span className={`text-sm ${groupedSort === col.key ? "text-green-900" : "text-gray-400"}`}>
                        {groupedSort === col.key ? (groupedDirection === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.map((row, i) => (
                <tr key={`${row.group_key}-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-200 px-3 py-2 font-semibold text-green-900">{row.group_label}</td>
                  <td className={`border border-gray-200 px-3 py-2 ${groupedSort === "total_amount" ? "bg-green-50" : ""}`}>{formatMoney(row.total_amount)}</td>
                  <td className={`border border-gray-200 px-3 py-2 ${groupedSort === "paid_amount" ? "bg-green-50" : ""}`}>{formatMoney(row.paid_amount)}</td>
                  <td className={`border border-gray-200 px-3 py-2 ${groupedSort === "unpaid_amount" ? "bg-green-50" : ""}`}>{formatMoney(row.unpaid_amount)}</td>
                  <td className={`border border-gray-200 px-3 py-2 ${groupedSort === "fee_count" ? "bg-green-50" : ""}`}>{formatNumber(row.fee_count)}</td>
                  <td className={`border border-gray-200 px-3 py-2 ${groupedSort === "paid_count" ? "bg-green-50" : ""}`}>{formatNumber(row.paid_count)}</td>
                  <td className={`border border-gray-200 px-3 py-2 ${groupedSort === "unpaid_count" ? "bg-green-50" : ""}`}>{formatNumber(row.unpaid_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const columns = getFeesColumns(periodLabel);

  return (
    <ReportTable
      reportType="revenue"
      sort={sort}
      sortDirection={sortDirection}
      data={data}
      columns={columns}
      hiddenColumnKeys={hiddenColumnKeys}
      onSortChange={onSortChange}
      onColumnVisibilityChange={onColumnVisibilityChange}
    />
  );
}

export function getFeesColumns(periodLabel) {
  return [
    {
      key: "borrower",
      label: "Borrower",
      sortable: false,
      hideable: false,
      width: 220,
      render: (item) => (
        <div className="min-w-[200px]">
          <div className="font-semibold text-green-900">
            {item.First_name} {item.Last_name}
          </div>
          <div className="text-xs text-gray-500">ID: {item.Person_ID} · {formatRole(item.role)}</div>
        </div>
      ),
      exportValue: (item) => `${item.First_name} ${item.Last_name} (ID: ${item.Person_ID})`,
    },
    {
      key: "Item_name",
      label: `Item (${periodLabel})`,
      width: 200,
      render: (item) => (
        <div className="min-w-[180px]">
          <div className="font-medium text-gray-800">{item.Item_name}</div>
          <div className="text-xs text-gray-500">{formatItemType(item.Item_type)}</div>
        </div>
      ),
      exportValue: (item) => `${item.Item_name} (${formatItemType(item.Item_type)})`,
    },
    {
      key: "fee_type",
      label: "Fee Type",
      width: 110,
      render: (item) => formatFeeType(item.fee_type),
      exportValue: (item) => formatFeeType(item.fee_type),
    },
    {
      key: "fee_amount",
      label: "Amount",
      width: 110,
      render: (item) => formatMoney(item.fee_amount),
      exportValue: (item) => formatMoney(item.fee_amount),
    },
    {
      key: "fee_status",
      label: "Status",
      width: 100,
      render: (item) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${Number(item.fee_status) === 2 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
          {formatFeeStatus(item.fee_status)}
        </span>
      ),
      exportValue: (item) => formatFeeStatus(item.fee_status),
    },
    {
      key: "date_owed",
      label: "Date Incurred",
      width: 130,
      render: (item) => formatDate(item.date_owed),
      exportValue: (item) => formatDate(item.date_owed),
    },
    {
      key: "Payment_Date",
      label: "Payment Date",
      width: 130,
      render: (item) => formatDate(item.Payment_Date),
      exportValue: (item) => formatDate(item.Payment_Date),
    },
  ];
}
