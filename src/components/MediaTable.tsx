import React from "react";

const FIRST_COLUMN_INDENT_PX = 38;
const RIGHT_ALIGN_PADDING_PX = 16;
const TRAILING_COLUMN_WIDTH_PX = 40;

export interface MediaTableHeader {
  label: string;
  align?: "right";
  width?: number;
}

interface MediaTableProps {
  headers: MediaTableHeader[];
  children: React.ReactNode;
}

const MediaTable: React.FC<MediaTableProps> = ({ headers, children }) => (
  <table className="content-table">
    <thead>
      <tr>
        {headers.map((header, index) => (
          <th
            key={header.label}
            style={{
              paddingLeft: index === 0 ? FIRST_COLUMN_INDENT_PX : undefined,
              textAlign: header.align,
              paddingRight:
                header.align === "right" ? RIGHT_ALIGN_PADDING_PX : undefined,
              width: header.width,
            }}
          >
            {header.label}
          </th>
        ))}
        <th style={{ width: TRAILING_COLUMN_WIDTH_PX }} />
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

export default MediaTable;
