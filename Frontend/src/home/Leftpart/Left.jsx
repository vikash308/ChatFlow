import React from "react";
import Search from "./Search";
import Users from "./Users";
import Logout from "./Logout";

function Left() {
  return (
    <div
      className="w-full h-full flex flex-col
     bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100
      border-r border-purple-200
      text-gray-700"
    >
      <Search />
      <div
        className=" flex-1  overflow-y-auto"
        style={{ minHeight: "calc(84vh - 10vh)" }}
      >
        <Users />
      </div>
      <Logout />
    </div>
  );
}

export default Left;
