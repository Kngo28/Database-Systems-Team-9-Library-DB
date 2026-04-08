import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { apiFetch } from "../api";
import { getSessionRoleState } from "../auth";
import {
  InfoBox,
  PeriodPickerControl,
  SelectControl,
  getDefaultPeriodValue,
  getPeriodSelectionLabel,
} from "./reports/reportShared";
import {
  PopularityReportsFilters,
  PopularityReportsTable,
  popularityReportPage,
} from "./reports/PopularityReportsPage";
import { FeesReportsFilters, FeesReportsTable, feesReportPage } from "./reports/FeesReportsPage";
import {
  PatronActivityReportsFilters,
  PatronActivityReportsTable,
  patronActivityReportPage,
} from "./reports/PatronActivityReportsPage";

const REPORT_DEFINITIONS = {
  popularity: {
    ...popularityReportPage,
    FiltersComponent: PopularityReportsFilters,
    TableComponent: PopularityReportsTable,
  },
  fees: {
    ...feesReportPage,
    FiltersComponent: FeesReportsFilters,
    TableComponent: FeesReportsTable,
  },
  patrons: {
    ...patronActivityReportPage,
    FiltersComponent: PatronActivityReportsFilters,
    TableComponent: PatronActivityReportsTable,
  },
};

const REPORT_OPTIONS = Object.values(REPORT_DEFINITIONS).map((report) => ({
  label: report.label,
  value: report.key,
}));

function createReportStateMap(getValue) {
  return Object.fromEntries(
    Object.values(REPORT_DEFINITIONS).map((report) => [report.key, getValue(report)])
  );
}

function createInitialSortState() {
  return createReportStateMap((report) => report.defaultSort);
}

function createInitialSortDirectionState() {
  return createReportStateMap(() => "desc");
}

function createInitialFilterState() {
  return createReportStateMap((report) => report.createInitialFilters());
}

function buildReportParams(reportDefinition, sort, sortDirection, filters) {
  const params = new URLSearchParams();

  if (sort) {
    params.set("sort", sort);
  }

  if (sortDirection) {
    params.set("direction", sortDirection);
  }

  reportDefinition.buildParams(params, filters);

  return params;
}

function buildReportUrl(reportDefinition, sort, sortDirection, filters) {
  const params = buildReportParams(reportDefinition, sort, sortDirection, filters);
  const query = params.toString();
  return `${reportDefinition.endpoint}${query ? `?${query}` : ""}`;
}

export default function ReportsPage() {
  const { isAdmin } = getSessionRoleState();
  const token = sessionStorage.getItem("token");

  const [reportType, setReportType] = useState("popularity");
  const [sortByReport, setSortByReport] = useState(createInitialSortState);
  const [sortDirectionByReport, setSortDirectionByReport] = useState(
    createInitialSortDirectionState
  );
  const [filtersByReport, setFiltersByReport] = useState(createInitialFilterState);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeReport = REPORT_DEFINITIONS[reportType];
  const currentSort = sortByReport[reportType];
  const currentSortDirection = sortDirectionByReport[reportType];
  const currentFilters = filtersByReport[reportType];
  const reportPeriodLabel = getPeriodSelectionLabel(
    currentFilters.periodType,
    currentFilters.periodValue,
    currentFilters.customStart,
    currentFilters.customEnd
  );
  const ActiveFiltersComponent = activeReport.FiltersComponent;
  const ActiveTableComponent = activeReport.TableComponent;

  function updateCurrentSort(value) {
    setSortByReport((prev) => ({
      ...prev,
      [reportType]: value,
    }));
  }

  function updateCurrentSortDirection(value) {
    setSortDirectionByReport((prev) => ({
      ...prev,
      [reportType]: value,
    }));
  }

  function updateCurrentFilters(updater) {
    setFiltersByReport((prev) => ({
      ...prev,
      [reportType]: updater(prev[reportType]),
    }));
  }

  useEffect(() => {
    if (!token) {
      setError("Not logged in.");
      setLoading(false);
      return;
    }

    async function fetchReport() {
      try {
        setLoading(true);
        setError("");
        const url = buildReportUrl(activeReport, currentSort, currentSortDirection, currentFilters);

        const response = await apiFetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Failed to load report");
        }

        setData(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Failed to fetch report:", err);
        setError(err.message || "Failed to load report");
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [token, activeReport, currentSort, currentSortDirection, currentFilters]);

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  function handleColumnSort(columnKey) {
    const nextDirection =
      currentSort === columnKey && currentSortDirection === "desc" ? "asc" : "desc";

    updateCurrentSort(columnKey);
    updateCurrentSortDirection(nextDirection);
  }

  function updateCurrentFilter(key, value) {
    if (key === "periodType") {
      updateCurrentFilters((filters) => ({
        ...filters,
          periodType: value,
          periodValue:
            filters.periodType === value
              ? filters.periodValue
              : getDefaultPeriodValue(value),
      }));
      return;
    }

    if (key === "customDateRange") {
      updateCurrentFilters((filters) => ({
        ...filters,
        customStart: value.startDate,
        customEnd: value.endDate,
      }));
      return;
    }

    updateCurrentFilters((filters) => ({
      ...filters,
      [key]: value,
    }));
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationBar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-green-900 mb-2">Reports</h1>
        <p className="text-gray-600 mb-6">{activeReport.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <SelectControl
              label="Report"
              value={reportType}
              onChange={setReportType}
              options={REPORT_OPTIONS}
            />

            <PeriodPickerControl
              periodType={currentFilters.periodType}
              periodValue={currentFilters.periodValue}
              customStart={currentFilters.customStart}
              customEnd={currentFilters.customEnd}
              onPeriodTypeChange={(value) => updateCurrentFilter("periodType", value)}
              onPeriodValueChange={(value) => updateCurrentFilter("periodValue", value)}
              onCustomDateChange={(startDate, endDate) =>
                updateCurrentFilter("customDateRange", { startDate, endDate })
              }
            />

            <ActiveFiltersComponent filters={currentFilters} onChange={updateCurrentFilter} />
          </div>
        </div>

        {loading && <InfoBox text="Loading..." />}
        {error && <InfoBox text={error} error />}
        {!loading && !error && data.length === 0 && <InfoBox text="No data found." />}

        {!loading && !error && data.length > 0 && (
          <ActiveTableComponent
            data={data}
            periodLabel={reportPeriodLabel}
            sort={currentSort}
            sortDirection={currentSortDirection}
            onSortChange={handleColumnSort}
          />
        )}
      </div>
    </div>
  );
}
