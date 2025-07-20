"use client";

import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
// import "./style.css";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import {
  ClientSideRowModelModule,
  ColDef,
  GetContextMenuItemsParams,
  GridReadyEvent,
  MenuItemDef,
  ModuleRegistry,
  ValidationModule,
  RowDragModule,
  SelectEditorModule,
  TooltipModule,
} from "ag-grid-community";
import {
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ContextMenuModule,
  ExcelExportModule,
  IntegratedChartsModule,
  NumberEditorModule,
  TextEditorModule,
} from "ag-grid-enterprise";
import { IOlympicData } from "./interfaces";

import { themeQuartz } from "ag-grid-community";
import { useSelector } from "react-redux";

ModuleRegistry.registerModules([
  TooltipModule,
  NumberEditorModule,
  TextEditorModule,
  ClientSideRowModelModule,
  ClipboardModule,
  ExcelExportModule,
  ColumnMenuModule,
  ContextMenuModule,
  CellSelectionModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
  RowDragModule,
  SelectEditorModule,
  ValidationModule /* Development Only */,
]);

const AgGridDataGrid = (props) => {
  const contextMenu = props.contextMenu || [];
  const [gridApi, setGridApi] = useState(null);

  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);

  // Calculate dynamic height based on row count
  const gridHeight = useMemo(() => {
    const rowCount = props.rows?.length || 0;
    const headerHeight = 40;
    const rowHeight = 28;
    const maxRows = 10;

    if (rowCount === 0) {
      return headerHeight + 100; // Show empty state
    }

    if (rowCount <= maxRows) {
      // Fit content exactly
      return headerHeight + rowCount * rowHeight + 2; // +2 for borders
    } else {
      // Fixed height with scrolling
      return headerHeight + maxRows * rowHeight + 2;
    }
  }, [props.rows?.length]);

  const gridStyle = useMemo(
    () => ({
      height: `${gridHeight}px`,
      width: "100%",
    }),
    [gridHeight],
  );

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      editable: true,
      minWidth: 100,
      resizable: true,
    };
  }, []);

  const getContextMenuItems = useCallback(
    (
      params: GetContextMenuItemsParams,
    ): (string | MenuItemDef)[] | Promise<(string | MenuItemDef)[]> => {
      const result: (string | MenuItemDef)[] = [
        ...contextMenu,
        ...props.getContextMenuItems(params),
        "copy",
        "separator",
        "chartRange",
      ];
      if (params.column?.getColId() === "country") {
        return new Promise((res) => setTimeout(() => res(result), 150));
      }
      return result;
    },
    [contextMenu, props],
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const { isDarkMode } = useSelector((state: any) => state.uiState);

  const darkTheme = themeQuartz.withParams({
    accentColor: "#15BDE8",
    backgroundColor: "#0C0C0D",
    borderColor: "#2A2A2A", // Light borders for dark mode
    foregroundColor: "#BBBEC9",
    headerBackgroundColor: "#182226",
    headerTextColor: "#FFFFFF",
    cellHorizontalBorder: true,
    cellVerticalBorder: true,
    rowBorder: "#2A2A2A",
    columnBorder: "#2A2A2A",
    wrapperBorder: "#2A2A2A",
    wrapperBorderRadius: "4px",
  });

  const lightTheme = themeQuartz.withParams({
    accentColor: "#15BDE8",
    backgroundColor: "#ffffff",
    borderColor: "#D1D5DB", // Dark borders for light mode
    foregroundColor: "#000000",
    headerBackgroundColor: "#f4f5f8",
    headerTextColor: "#000000",
    cellHorizontalBorder: true,
    cellVerticalBorder: true,
    rowBorder: "#D1D5DB",
    columnBorder: "#D1D5DB",
    wrapperBorder: "#D1D5DB",
    wrapperBorderRadius: "4px",
  });

  // Additional CSS for enhanced borders
  const additionalStyles = useMemo(
    () => ({
      ...(isDarkMode
        ? {
            "--ag-border-color": "#2A2A2A",
            "--ag-row-border-color": "#2A2A2A",
            "--ag-cell-horizontal-border": "1px solid #2A2A2A",
          }
        : {
            "--ag-border-color": "#D1D5DB",
            "--ag-row-border-color": "#D1D5DB",
            "--ag-cell-horizontal-border": "1px solid #D1D5DB",
          }),
    }),
    [isDarkMode],
  );

  return (
    <div style={{ ...gridStyle, ...additionalStyles }}>
      <AgGridReact<IOlympicData>
        tooltipShowDelay={0}
        noRowsOverlayComponent={props.noRowsOverlayComponent}
        context={props.context}
        rowDragManaged={true}
        theme={isDarkMode ? darkTheme : lightTheme}
        style={containerStyle}
        rowData={props.rows}
        columnDefs={props.columns}
        defaultColDef={defaultColDef}
        cellSelection={true}
        allowContextMenuWithControlKey={false}
        getContextMenuItems={getContextMenuItems}
        onGridReady={onGridReady}
        suppressHorizontalScroll={false}
        suppressScrollOnNewData={true}
        rowHeight={28}
        headerHeight={40}
        // Enhanced border styling
        rowClass={isDarkMode ? "ag-row-dark" : "ag-row-light"}
        // Enable scrolling when needed
        alwaysShowHorizontalScroll={false}
        alwaysShowVerticalScroll={props.rows?.length > 10}
      />

      <style jsx>{`
        :global(.ag-theme-quartz) {
          --ag-cell-horizontal-border: 1px solid
            ${isDarkMode ? "#2A2A2A" : "#D1D5DB"};
          --ag-row-border-color: ${isDarkMode ? "#2A2A2A" : "#D1D5DB"};
          --ag-border-color: ${isDarkMode ? "#2A2A2A" : "#D1D5DB"};
        }

        :global(.ag-row-dark) {
          border-bottom: 1px solid #2a2a2a !important;
        }

        :global(.ag-row-light) {
          border-bottom: 1px solid #d1d5db !important;
        }

        :global(.ag-cell) {
          border-right: 1px solid ${isDarkMode ? "#2A2A2A" : "#D1D5DB"} !important;
        }

        :global(.ag-header-cell) {
          border-right: 1px solid ${isDarkMode ? "#2A2A2A" : "#D1D5DB"} !important;
          border-bottom: 1px solid ${isDarkMode ? "#2A2A2A" : "#D1D5DB"} !important;
        }
      `}</style>
    </div>
  );
};

export default AgGridDataGrid;
