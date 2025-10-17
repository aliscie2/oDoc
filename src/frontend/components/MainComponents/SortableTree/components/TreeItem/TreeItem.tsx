import React, { forwardRef, HTMLAttributes, useCallback, useMemo } from "react";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { IconButton, Tooltip } from "@mui/material";
import { Action } from "./Action";
import { Handle } from "./Handle";
import ContextMenu from "../../../../MuiComponents/ContextMenu";
import DeleteFile from "../../../../Actions/DeleteFile";
import ChangeWorkSpace from "../../../../Actions/ChangeWorkSpaceFile";
import styles from "./TreeItem.module.css";
import type { RootState } from "../../../../../redux/reducers";

export interface Props extends HTMLAttributes<HTMLLIElement> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indentationWidth: number;
  value: string;
  onCollapse?(): void;
  onRemove?(): void;
  wrapperRef?(node: HTMLLIElement): void;
  id?: string;
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      collapsed,
      depth,
      disableInteraction,
      disableSelection,
      ghost,
      handleProps,
      id,
      indentationWidth,
      indicator,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref,
  ) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const files = useSelector((state: RootState) => state.filesState.files);

    const handleClick = useCallback(() => {
      if (!id) return;
      const file = files.find((f) => f.id === id);
      if (file) {
        dispatch({ type: "CURRENT_FILE", file });
        navigate(id);
      }
    }, [id, files, dispatch, navigate]);

    const contextOptions = useMemo(
      () => [
        {
          content: <DeleteFile item={{ id, name: value }} />,
          preventClose: true,
          pure: true,
        },
        {
          content: <ChangeWorkSpace item={{ id, name: value }} />,
          preventClose: true,
          pure: true,
        },
      ],
      [id, value],
    );

    return (
      <li
        ref={wrapperRef}
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction,
        )}
        style={
          {
            "--spacing": `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div ref={ref} className={styles.TreeItem} style={style}>
          <Handle {...handleProps} />
          {onCollapse && (
            <Action
              onClick={onCollapse}
              className={classNames(
                styles.Collapse,
                collapsed && styles.collapsed,
              )}
            >
              <IconButton size="small" onClick={onCollapse}>
                <KeyboardArrowUpIcon />
              </IconButton>
            </Action>
          )}
          <ContextMenu options={contextOptions}>
            <Tooltip title="Right-click for options" placement="right" arrow>
              <span
                onClick={handleClick}
                className={styles.Text}
                style={{ cursor: "context-menu" }}
              >
                {value}
              </span>
            </Tooltip>
          </ContextMenu>
          {clone && childCount && childCount > 1 && (
            <span className={styles.Count}>{childCount}</span>
          )}
        </div>
      </li>
    );
  },
);

TreeItem.displayName = "TreeItem";
