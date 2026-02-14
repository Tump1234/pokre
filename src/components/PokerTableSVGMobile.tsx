import React from "react";

const PokerTableMobile = () => {
  return (
    <div className="poker-table-wrapper-mb">
      <div className="poker-table-mb" />
      <div className="felt-color-mb" />
      <div className="felt-shadow-mb" />
      <div className="--detail-in-table">
        <div className="--logo-in-table"></div>
      </div>
    </div>
  );
};

export default React.memo(PokerTableMobile);
