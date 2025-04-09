import React from "react";
import { Redirect } from "wouter";
import Home from "./Home";

// Redirect the index page to home component to avoid duplication
export default function Index() {
  return <Redirect to="/" />;
}