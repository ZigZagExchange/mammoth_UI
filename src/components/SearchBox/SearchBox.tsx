import React from "react";

export default function SearchBox(props: any) {

  function handleChange(e: any) {
    props.searchPair(e.target.value);
  }

  return (
    <>
      <div className={props.className}>
        <input
          placeholder="Search..."
          type="text"
          value={props.searchValue}
          onChange={handleChange}
        />
      </div>
    </>
  );
}
