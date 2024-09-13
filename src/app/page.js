"use client";
import React, { useState, useEffect } from "react";
import { Container, Table } from "react-bootstrap";
import classes from "./page.module.css";
import moment from "moment";
import ReactSelect from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDebounce } from "../components/UseDebounce/useDebounce";

const Home = () => {
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const debouncedSearch = useDebounce(searchTerm);

  const options = [
    { value: "all", label: "All statuses" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  async function fetchData(
    page = currentPage,
    search = debouncedSearch,
    filter = statusFilter
  ) {
    setLoading(true);
    try {
      const url = "https://7l60bxbl-3093.inc1.devtunnels.ms/api/v1/faqs";
      const response = await fetch(
        `${url}?limit=10&page=${page}&search=${search}&status=${filter}`,
        {
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZDY0NTc0NTUyNDJmYjYwNjQ5MGY0MCIsImlhdCI6MTcyNjA3NTQ5OCwiZXhwIjoxNzI2MTYxODk4fQ.OJxFgnHU95ZhOVTBPUM3ghBv2xDHSsNJW-MKo91AmkM",
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      setFaqs(data.data.faqs);
      setTotalPages(Math.ceil(data.data.totalCount / 10));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(1, debouncedSearch, statusFilter);
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "all";
    setStatusFilter(value);
    setCurrentPage(1);
    fetchData(1, debouncedSearch, value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(page, searchTerm, statusFilter);
  };

  if (error) return <p>Error: {error.message}</p>;

  return (
    <Container className={classes.mainBody}>
      <div className={classes.contentBody}>
        <h1 className={classes.mainHeading}>FAQs</h1>
        <div className={classes.inputs}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search FAQs"
            className={classes.searchInput}
          />
          <ReactSelect
            options={options}
            placeholder="Select status"
            value={options.find((option) => option.value === statusFilter)}
            onChange={handleStatusChange}
            className={classes.statusFilter}
          />
        </div>

        {loading ? (
          <h1 className={classes.loading}>Loading...</h1>
        ) : error ? (
          <p>Error: {error.message}</p>
        ) : faqs.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Answer</th>
                <th>Category</th>
                <th>Active</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq, index) => (
                <tr key={faq._id}>
                  <td>{(currentPage - 1) * 10 + index + 1}</td>
                  <td>{faq.question}</td>
                  <td>{faq.answer}</td>
                  <td>{faq.category.name}</td>
                  <td>{faq.active ? "Yes" : "No"}</td>
                  <td>{moment().format("MMM Do YY")}</td>
                  <td>{moment(faq.updatedAt).format("MMM Do YY")}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <h1 className={classes.loading}>No FAQs available.</h1>
        )}

        <div className={classes.paginationControls}>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={
                currentPage === index + 1
                  ? classes.activePageButton
                  : classes.pageButton
              }
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Home;
