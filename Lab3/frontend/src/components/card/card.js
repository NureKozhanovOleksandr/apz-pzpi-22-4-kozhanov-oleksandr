import React from "react";
import "./card.css";

const Card = ({ data, columns }) => {
  const formatDate = (value) => {
    

    if (!value) return { date: "", time: "" };
    const date = new Date(value);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="card">
      {columns.map((col, index) => (
        <div key={index} className="card-field">
          <div className="header">{col.headerName}</div>
          {col.cellRenderer ? (
            col.cellRenderer({ data })
          ) : col.headerName === "Date" ? (
            <span className="data">
              <p>{formatDate(data[col.field]).date}</p>
              <p>{formatDate(data[col.field]).time}</p>
            </span>
          ) : (
            <span className="data">{data[col.field]}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Card;
