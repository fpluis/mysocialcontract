import React from "react";
import { Typography } from "antd";

export default function Description({ text, ellipsis = false }) {
  const paragraphs = text.split(/\n/giu);
  return (
    <>
      {paragraphs.map((paragraph, key) => (
        <Typography.Paragraph key={key} ellipsis={ellipsis}>
          {paragraph}
        </Typography.Paragraph>
      ))}
    </>
  );
}
