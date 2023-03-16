import React from "react";
import { Link } from "react-router-dom";
import MiniCart from "./MiniCart";
import Login from "./Login";
import pglogo from "../images/pglogo.svg";
import "tailwindcss/tailwind.css";

export default function Header() {
  return (
    <div className="p-5 bg-blue-500 text-white text-2xl font-bold">
      <div className="flex">
        <div className="grow flex">
          <Link to="/">
            <img
              className="h-full"
              src={pglogo}
              alt="Procter and Gamble logo"
            />
          </Link>
        </div>
        <div className="flex-end relative">
          <Link id="pdp" to="/">
            Home
          </Link>
          <span className="mx-5">|</span>
          <Link id="pdp" to="/product/2">
            PDP
          </Link>
          <span className="mx-5">|</span>
          <Link id="cart" to="/cart">
            Cart
          </Link>
          <span className="mx-5">|</span>
          <MiniCart />
          <span className="mx-5">|</span>
          <Login />
        </div>
      </div>
    </div>
  );
}
