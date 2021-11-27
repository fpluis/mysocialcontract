import React from "react";
import { Typography } from "antd";

export default function Description({ text, fontSize = "1.2rem", ellipsis = false }) {
  const paragraphs = text.split(/\n/giu);
  return (
    <div style={{ fontSize }}>
      {paragraphs.map((paragraph, key) => (
        <Typography.Paragraph key={key} ellipsis={ellipsis}>
          {paragraph}
        </Typography.Paragraph>
      ))}
    </div>
  );
}
