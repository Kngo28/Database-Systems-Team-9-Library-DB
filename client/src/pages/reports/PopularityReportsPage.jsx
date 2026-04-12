/* eslint-disable react-refresh/only-export-components */
import {
  InputControl,
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
  getPopularityIdentityText,
  getRecommendationText,
  renderPopularityIdentityCell,
} from "./reportShared";

const ALL_OPTION = "All";
const BOOK_TYPE = "1";
const CD_ITEM_TYPE = "2";
const DEVICE_ITEM_TYPE = "3";

const CD_TYPE_OPTIONS = [
  { label: "All", value: ALL_OPTION },
  { label: "DVD", value: "1" },
  { label: "Blu ray", value: "2" },
  { label: "CD", value: "3" },
];

const DEVICE_TYPE_OPTIONS = [
  { label: "All", value: ALL_OPTION },
  { label: "Tablet", value: "1" },
  { label: "Misc", value: "2" },
  { label: "Laptop", value: "3" },
];

function setTrimmedParam(params, key, value) {
  const normalized = value.trim();

  if (normalized) {
    params.set(key, normalized);
  }
}

function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? ALL_OPTION;
}

function buildTypeSpecificExportSummary(filters) {
  if (filters.itemType === BOOK_TYPE) {
    return [
      { label: "Genre Search", value: filters.genre.trim() || ALL_OPTION },
      { label: "Author Search", value: filters.authorName.trim() || ALL_OPTION },
    ];
  }

  if (filters.itemType === CD_ITEM_TYPE) {
    return [{ label: "CD Type", value: getOptionLabel(CD_TYPE_OPTIONS, filters.cdType) }];
  }

  if (filters.itemType === DEVICE_ITEM_TYPE) {
    return [{ label: "Device Type", value: getOptionLabel(DEVICE_TYPE_OPTIONS, filters.deviceType) }];
  }

  return [];
}

function resetTypeSpecificFilters(nextType, onChange) {
  if (nextType !== BOOK_TYPE) {
    onChange("genre", "");
    onChange("authorName", "");
  }

  if (nextType !== CD_ITEM_TYPE) {
    onChange("cdType", ALL_OPTION);
  }

  if (nextType !== DEVICE_ITEM_TYPE) {
    onChange("deviceType", ALL_OPTION);
  }
}

export const popularityReportPage = {
  key: "popularity",
  label: "Popularity",
  pdfTitle: "Popularity Report",
  description:
    "Identify high-demand titles, inventory pressure, and items that may need more copies.",
  endpoint: "/api/reports/popularity",
  defaultSort: "times_checked_out",
  createInitialFilters() {
    return {
      itemType: ALL_OPTION,
      itemName: "",
      genre: "",
      authorName: "",
      cdType: ALL_OPTION,
      deviceType: ALL_OPTION,
      ...createDefaultPeriodFilters(),
    };
  },
  buildParams(params, filters) {
    appendPeriodParams(params, filters);
    if (filters.itemType !== ALL_OPTION) {
      params.set("type", filters.itemType);
    }
    setTrimmedParam(params, "itemName", filters.itemName);

    if (filters.itemType === BOOK_TYPE) {
      setTrimmedParam(params, "genre", filters.genre);
      setTrimmedParam(params, "authorName", filters.authorName);
    }

    if (filters.itemType === CD_ITEM_TYPE && filters.cdType !== ALL_OPTION) {
      params.set("cdType", filters.cdType);
    }

    if (filters.itemType === DEVICE_ITEM_TYPE && filters.deviceType !== ALL_OPTION) {
      params.set("deviceType", filters.deviceType);
    }
  },
  getExportSummary(filters) {
    return [
      {
        label: "Item Type",
        value: getOptionLabel(ITEM_TYPE_OPTIONS, filters.itemType),
      },
      { label: "Item Search", value: filters.itemName.trim() || ALL_OPTION },
      ...buildTypeSpecificExportSummary(filters),
    ];
  },
};

export function PopularityReportsFilters({ filters, onChange }) {
  function handleItemTypeChange(value) {
    onChange("itemType", value);
    resetTypeSpecificFilters(value, onChange);
  }

  return (
    <>
      <SelectControl
        label="Item Type"
        value={filters.itemType}
        onChange={handleItemTypeChange}
        options={ITEM_TYPE_OPTIONS}
      />
      <InputControl
        label="Item Name"
        value={filters.itemName}
        onChange={(value) => onChange("itemName", value)}
        placeholder="Search by item title"
      />
      {filters.itemType === BOOK_TYPE && (
        <>
          <InputControl
            label="Genre"
            value={filters.genre}
            onChange={(value) => onChange("genre", value)}
            placeholder="Search by genre"
          />
          <InputControl
            label="Author Name"
            value={filters.authorName}
            onChange={(value) => onChange("authorName", value)}
            placeholder="Search firstname lastname"
          />
        </>
      )}
      {filters.itemType === CD_ITEM_TYPE && (
        <SelectControl
          label="CD Type"
          value={filters.cdType}
          onChange={(value) => onChange("cdType", value)}
          options={CD_TYPE_OPTIONS}
        />
      )}
      {filters.itemType === DEVICE_ITEM_TYPE && (
        <SelectControl
          label="Device Type"
          value={filters.deviceType}
          onChange={(value) => onChange("deviceType", value)}
          options={DEVICE_TYPE_OPTIONS}
        />
      )}
    </>
  );
}

export function PopularityReportsTable({
  data,
  periodLabel,
  sort,
  sortDirection,
  hiddenColumnKeys,
  onSortChange,
  onColumnVisibilityChange,
}) {
  const columns = getPopularityColumns(periodLabel);

  return (
    <ReportTable
      reportType="popularity"
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

export function getPopularityColumns(periodLabel) {
  return [
    {
      key: "item_name",
      label: "Item",
      sortable: false,
      hideable: false,
      render: renderPopularityIdentityCell,
      exportValue: getPopularityIdentityText,
    },
    {
      key: "times_checked_out",
      label: `Checkouts (${periodLabel})`,
      render: (item) => formatNumber(item.times_checked_out),
      exportValue: (item) => formatNumber(item.times_checked_out),
    },
    {
      key: "borrowing_rate",
      label: `Borrow Rate (${periodLabel})`,
      render: (item) => formatDecimal(item.borrowing_rate),
      exportValue: (item) => formatDecimal(item.borrowing_rate),
    },
    {
      key: "utilization_rate",
      label: `Utilization (${periodLabel})`,
      render: (item) => formatPercent(item.utilization_rate),
      exportValue: (item) => formatPercent(item.utilization_rate),
    },
    {
      key: "demand_ratio",
      label: `Demand Ratio (${periodLabel})`,
      render: (item) => formatDecimal(item.demand_ratio),
      exportValue: (item) => formatDecimal(item.demand_ratio),
    },
    {
      key: "active_holds",
      label: `Holds (${periodLabel})`,
      render: (item) => formatNumber(item.active_holds),
      exportValue: (item) => formatNumber(item.active_holds),
    },
    {
      key: "unique_borrowers",
      label: `Unique Borrowers (${periodLabel})`,
      render: (item) => formatNumber(item.unique_borrowers),
      exportValue: (item) => formatNumber(item.unique_borrowers),
    },
    {
      key: "num_copies",
      label: "Copies Owned",
      render: (item) => formatNumber(item.num_copies),
      exportValue: (item) => formatNumber(item.num_copies),
    },
    {
      key: "available_copies",
      label: "Available Now",
      render: (item) => formatNumber(item.available_copies),
      exportValue: (item) => formatNumber(item.available_copies),
    },
    {
      key: "checked_out_copies",
      label: "Checked Out Now",
      render: (item) => formatNumber(item.checked_out_copies),
      exportValue: (item) => formatNumber(item.checked_out_copies),
    },
    {
      key: "last_borrow_date",
      label: `Last Borrowed (${periodLabel})`,
      render: (item) => formatDate(item.last_borrow_date),
      exportValue: (item) => formatDate(item.last_borrow_date),
    },
    {
      key: "recommended_additional_copies",
      label: "Stock Recommendation",
      render: (item) => <RecommendationCell item={item} />,
      exportValue: getRecommendationText,
    },
  ];
}
