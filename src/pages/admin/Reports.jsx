
import React, { useEffect, useMemo, useState } from "react";
import { DB } from './components/Header'
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Package,
  IndianRupee,
  CalendarDays,
  RefreshCw,
  Filter,
  Trophy,
  Layers,
  Download,
  Users,
  FileText,
  Printer,
  Search,
  ArrowUpDown,
} from "lucide-react";

import Header from "./components/Header";

function Reports() {
  const API = `${DB}`;

  const now = new Date();

  const getLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reportType, setReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(getLocalDate(now));
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  const [fromDate, setFromDate] = useState(
    getLocalDate(new Date(now.getFullYear(), now.getMonth(), 1))
  );
  const [toDate, setToDate] = useState(getLocalDate(now));

  const [productSearch, setProductSearch] = useState("");
  const [sortBy, setSortBy] = useState("quantity");

  // Fetch database data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [orderRes, productRes, userRes] = await Promise.all([
        fetch(`${API}/cart?status=0`),
        fetch(`${API}/products`),
        fetch(`${API}/users`),
      ]);

      if (!orderRes.ok || !productRes.ok || !userRes.ok) {
        throw new Error("Unable to fetch report data.");
      }

      const [orderData, productData, userData] = await Promise.all([
        orderRes.json(),
        productRes.json(),
        userRes.json(),
      ]);

      setOrders(
        orderData.filter((item) => Number(item.status) === 0)
      );

      setProducts(productData);
      setUsers(userData);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Find product
  const getProduct = (productId) => {
    return products.find(
      (product) => String(product.id) === String(productId)
    );
  };

  // Find customer
  const getUser = (userId) => {
    return users.find(
      (user) => String(user.id) === String(userId)
    );
  };

  // Get date key
  const getDateKey = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (!Number.isNaN(date.getTime())) {
      return getLocalDate(date);
    }

    const parsed = new Date(String(dateString).split(",")[0]);

    if (!Number.isNaN(parsed.getTime())) {
      return getLocalDate(parsed);
    }

    return "";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format currency
  const formatPrice = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  // Get order amount
  const getOrderTotal = (order) => {
    const product = getProduct(order.productId);

    return (
      Number(product?.price || 0) *
      Number(order.quantity || 0)
    );
  };

  // Get category name
  const getCategory = (product) => {
    return (
      product?.category ||
      product?.categoryName ||
      product?.category_name ||
      "Uncategorized"
    );
  };

  // Filter orders according to selected report
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = getDateKey(order.purchaseDate);

      if (!orderDate) return false;

      if (reportType === "daily") {
        return orderDate === selectedDate;
      }

      if (reportType === "monthly") {
        return orderDate.startsWith(selectedMonth);
      }

      return orderDate >= fromDate && orderDate <= toDate;
    });
  }, [
    orders,
    reportType,
    selectedDate,
    selectedMonth,
    fromDate,
    toDate,
  ]);

  // Total quantity
  const totalQuantity = filteredOrders.reduce(
    (total, order) => total + Number(order.quantity || 0),
    0
  );

  // Total revenue
  const totalRevenue = filteredOrders.reduce(
    (total, order) => total + getOrderTotal(order),
    0
  );

  // Average order value
  const averageOrderValue =
    filteredOrders.length > 0
      ? totalRevenue / filteredOrders.length
      : 0;

  // Unique customers
  const uniqueCustomers = new Set(
    filteredOrders.map((order) => String(order.userId))
  ).size;

  // Product performance
  const productReports = useMemo(() => {
    const reportMap = {};

    filteredOrders.forEach((order) => {
      const product = getProduct(order.productId);

      if (!product) return;

      const id = String(product.id);

      if (!reportMap[id]) {
        reportMap[id] = {
          id,
          name: product.name || "Unknown Product",
          code: product.productCode || "N/A",
          image: product.image || "",
          category: getCategory(product),
          quantity: 0,
          revenue: 0,
          orders: 0,
        };
      }

      reportMap[id].quantity += Number(order.quantity || 0);
      reportMap[id].revenue += getOrderTotal(order);
      reportMap[id].orders += 1;
    });

    return Object.values(reportMap).sort((a, b) => {
      if (sortBy === "revenue") {
        return b.revenue - a.revenue;
      }

      return b.quantity - a.quantity;
    });
  }, [filteredOrders, products, sortBy]);

  // Category performance
  const categoryReports = useMemo(() => {
    const categoryMap = {};

    filteredOrders.forEach((order) => {
      const product = getProduct(order.productId);

      if (!product) return;

      const category = getCategory(product);

      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          quantity: 0,
          revenue: 0,
          orders: 0,
        };
      }

      categoryMap[category].quantity += Number(order.quantity || 0);
      categoryMap[category].revenue += getOrderTotal(order);
      categoryMap[category].orders += 1;
    });

    return Object.values(categoryMap).sort(
      (a, b) => b.quantity - a.quantity
    );
  }, [filteredOrders, products]);

  // Customer performance
  const customerReports = useMemo(() => {
    const customerMap = {};

    filteredOrders.forEach((order) => {
      const user = getUser(order.userId);
      const id = String(order.userId);

      if (!customerMap[id]) {
        customerMap[id] = {
          id,
          name: user?.name || "Unknown Customer",
          email: user?.email || "Email unavailable",
          orders: 0,
          quantity: 0,
          spent: 0,
        };
      }

      customerMap[id].orders += 1;
      customerMap[id].quantity += Number(order.quantity || 0);
      customerMap[id].spent += getOrderTotal(order);
    });

    return Object.values(customerMap).sort(
      (a, b) => b.spent - a.spent
    );
  }, [filteredOrders, users, products]);

  // Daily sales grouping
  const dailyReports = useMemo(() => {
    const dateMap = {};

    filteredOrders.forEach((order) => {
      const date = getDateKey(order.purchaseDate);

      if (!date) return;

      if (!dateMap[date]) {
        dateMap[date] = {
          date,
          orders: 0,
          quantity: 0,
          revenue: 0,
        };
      }

      dateMap[date].orders += 1;
      dateMap[date].quantity += Number(order.quantity || 0);
      dateMap[date].revenue += getOrderTotal(order);
    });

    return Object.values(dateMap).sort(
      (a, b) => a.date.localeCompare(b.date)
    );
  }, [filteredOrders, products]);

  // Most sold product
  const bestProduct = [...productReports].sort(
    (a, b) => b.quantity - a.quantity
  )[0];

  // Most popular category
  const bestCategory = categoryReports[0];

  // Report title
  const reportTitle = useMemo(() => {
    if (reportType === "daily") {
      return `Daily Report - ${formatDate(selectedDate)}`;
    }

    if (reportType === "monthly") {
      const date = new Date(`${selectedMonth}-01T00:00:00`);

      return `Monthly Report - ${date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })}`;
    }

    return `Period Report - ${formatDate(fromDate)} to ${formatDate(toDate)}`;
  }, [reportType, selectedDate, selectedMonth, fromDate, toDate]);

  // CSV export
  const downloadCSV = () => {
    const rows = [
      ["ADMIN SALES REPORT"],
      [reportTitle],
      [],
      ["Order ID", "Customer", "Product", "Category", "Quantity", "Revenue", "Purchase Date"],
      ...filteredOrders.map((order) => {
        const product = getProduct(order.productId);
        const user = getUser(order.userId);

        return [
          order.id,
          user?.name || "Unknown",
          product?.name || "Unknown Product",
          getCategory(product),
          order.quantity || 0,
          getOrderTotal(order),
          order.purchaseDate || "",
        ];
      }),
      [],
      ["TOTAL ORDERS", filteredOrders.length],
      ["TOTAL QUANTITY", totalQuantity],
      ["TOTAL REVENUE", totalRevenue],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `sales-report-${getLocalDate(new Date())}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Print / Save as PDF
  const printReport = () => {
    window.print();
  };

  // Product search
  const searchedProducts = productReports.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.code.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Maximum chart value
  const maxRevenue = Math.max(
    ...dailyReports.map((item) => item.revenue),
    1
  );

  const maxCategoryQuantity = Math.max(
    ...categoryReports.map((item) => item.quantity),
    1
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="ml-64 w-[calc(100%-16rem)] px-8 pb-10 pt-3">

        {/* Heading */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:mb-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600">
              <BarChart3 size={17} />
              BUSINESS ANALYTICS
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Reports
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Detailed sales, product, category and customer performance reports.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 print:hidden">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={downloadCSV}
              disabled={loading || filteredOrders.length === 0}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              onClick={printReport}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              <Printer size={16} />
              Print / PDF
            </button>
          </div>
        </div>

        {/* Report Filters */}
        <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm print:hidden">
          <div className="mb-5 flex items-center gap-2">
            <Filter size={19} className="text-amber-600" />

            <h2 className="font-bold text-gray-800">
              Generate Report
            </h2>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {[
              { value: "daily", label: "Daily Report" },
              { value: "monthly", label: "Monthly Report" },
              { value: "period", label: "Custom Period" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setReportType(item.value)}
                className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  reportType === item.value
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {reportType === "daily" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600">
                  Select Date
                </label>

                <input
                  type="date"
                  value={selectedDate}
                  max={getLocalDate(new Date())}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
                />
              </div>
            )}

            {reportType === "monthly" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600">
                  Select Month
                </label>

                <input
                  type="month"
                  value={selectedMonth}
                  max={`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
                />
              </div>
            )}

            {reportType === "period" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || getLocalDate(new Date())}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    max={getLocalDate(new Date())}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Reports are generated using completed purchases (Status: 0).
            </p>

            <button
              onClick={() => {
                setReportType("daily");
                setSelectedDate(getLocalDate(new Date()));
                setSelectedMonth(
                  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
                );
                setFromDate(
                  getLocalDate(new Date(now.getFullYear(), now.getMonth(), 1))
                );
                setToDate(getLocalDate(new Date()));
              }}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
            >
              Reset Filters
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-24">
            <RefreshCw size={30} className="animate-spin text-amber-500" />
            <p className="mt-3 text-sm text-gray-500">
              Generating reports...
            </p>
          </div>
        ) : (
          <>
            {/* Report Heading */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {reportTitle}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Generated on {formatDate(new Date().toISOString())}
                </p>
              </div>

              <span className="rounded-lg bg-green-50 px-4 py-2 text-xs font-bold text-green-700">
                Completed Orders
              </span>
            </div>

            {/* Sales Summary - Report data, not dashboard cards */}
            <section className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-amber-600" />
                  <h2 className="font-bold text-gray-900">
                    Sales Summary
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 md:grid-cols-4 md:divide-y-0">
                <div className="p-6">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-900">
                    {filteredOrders.length.toLocaleString("en-IN")}
                  </h3>
                </div>

                <div className="p-6">
                  <p className="text-sm text-gray-500">Products Sold</p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-900">
                    {totalQuantity.toLocaleString("en-IN")}
                  </h3>
                </div>

                <div className="p-6">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <h3 className="mt-2 text-2xl font-bold text-amber-600">
                    {formatPrice(totalRevenue)}
                  </h3>
                </div>

                <div className="p-6">
                  <p className="text-sm text-gray-500">Average Order Value</p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-900">
                    {formatPrice(averageOrderValue)}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 divide-y divide-gray-100 border-t border-gray-100 md:grid-cols-2 md:divide-x md:divide-y-0">
                <div className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm text-gray-500">
                    Purchasing Customers
                  </span>
                  <span className="font-bold text-gray-800">
                    {uniqueCustomers}
                  </span>
                </div>

                <div className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm text-gray-500">
                    Average Items per Order
                  </span>
                  <span className="font-bold text-gray-800">
                    {filteredOrders.length
                      ? (totalQuantity / filteredOrders.length).toFixed(2)
                      : "0"}
                  </span>
                </div>
              </div>
            </section>

            {/* Sales Trend */}
            <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 font-bold text-gray-900">
                    <TrendingUp size={19} className="text-amber-600" />
                    Sales Performance
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Revenue generated for each purchase date
                  </p>
                </div>

                <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                  {dailyReports.length} Active Days
                </span>
              </div>

              {dailyReports.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">
                  No sales data available for this report.
                </p>
              ) : (
                <div className="space-y-5">
                  {dailyReports.map((item) => (
                    <div key={item.date}>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {formatDate(item.date)}
                        </span>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{item.orders} Orders</span>
                          <span>{item.quantity} Items</span>
                          <strong className="text-gray-900">
                            {formatPrice(item.revenue)}
                          </strong>
                        </div>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all"
                          style={{
                            width: `${(item.revenue / maxRevenue) * 100}%`,
                            minWidth: item.revenue > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Product Performance */}
            <section className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="flex items-center gap-2 font-bold text-gray-900">
                    <Trophy size={19} className="text-amber-600" />
                    Product Performance
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Product-wise sales and revenue analysis
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 print:hidden">
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                    <Search size={15} className="text-gray-400" />
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product..."
                      className="w-36 text-xs outline-none"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none"
                  >
                    <option value="quantity">Sort by Quantity</option>
                    <option value="revenue">Sort by Revenue</option>
                  </select>
                </div>
              </div>

              {/* Best Product */}
              {bestProduct && (
                <div className="m-6 flex items-center gap-4 rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                    <Trophy size={25} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Best Selling Product
                    </p>

                    <h3 className="mt-1 truncate font-bold text-gray-900">
                      {bestProduct.name}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {bestProduct.quantity} units sold
                    </p>
                  </div>

                  <p className="text-right text-sm font-bold text-amber-700">
                    {formatPrice(bestProduct.revenue)}
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Orders</th>
                      <th className="px-6 py-4">Quantity Sold</th>
                      <th className="px-6 py-4">Revenue</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {searchedProducts.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-500">
                            #{index + 1}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-11 w-11 rounded-lg border border-gray-100 bg-gray-50 object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                                <Package size={18} />
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-gray-800">
                                {product.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {product.code}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.category}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.orders}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                            {product.quantity}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-gray-800">
                          {formatPrice(product.revenue)}
                        </td>
                      </tr>
                    ))}

                    {searchedProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-12 text-center text-sm text-gray-400"
                        >
                          No product sales found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Category Performance */}
            <section className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="flex items-center gap-2 font-bold text-gray-900">
                  <Layers size={19} className="text-amber-600" />
                  Category Performance
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Compare category-wise product sales
                </p>
              </div>

              {categoryReports.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">
                  No category data available.
                </p>
              ) : (
                <div className="space-y-6 p-6">
                  {bestCategory && (
                    <div className="mb-6 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Most Popular Category
                      </p>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {bestCategory.name}
                        </h3>

                        <span className="rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
                          {bestCategory.quantity} Items Sold
                        </span>
                      </div>
                    </div>
                  )}

                  {categoryReports.map((category) => (
                    <div key={category.name}>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {category.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {category.orders} orders
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">
                            {category.quantity} items
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatPrice(category.revenue)}
                          </p>
                        </div>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${(category.quantity / maxCategoryQuantity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Customer Performance */}
            <section className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="flex items-center gap-2 font-bold text-gray-900">
                  <Users size={19} className="text-amber-600" />
                  Customer Purchase Report
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Customer-wise purchase history and spending
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Orders</th>
                      <th className="px-6 py-4">Items Purchased</th>
                      <th className="px-6 py-4">Total Spent</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {customerReports.map((customer, index) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-700">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {customer.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {customer.orders}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {customer.quantity}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-gray-800">
                          {formatPrice(customer.spent)}
                        </td>
                      </tr>
                    ))}

                    {customerReports.length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-12 text-center text-sm text-gray-400"
                        >
                          No customer purchase records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Date-wise Sales Report */}
            <section className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="flex items-center gap-2 font-bold text-gray-900">
                  <CalendarDays size={19} className="text-amber-600" />
                  Date-wise Sales Report
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Complete sales breakdown for the selected report period
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Purchase Date</th>
                      <th className="px-6 py-4">Total Orders</th>
                      <th className="px-6 py-4">Items Sold</th>
                      <th className="px-6 py-4">Revenue</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {dailyReports.map((item) => (
                      <tr key={item.date} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                          {formatDate(item.date)}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.orders}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.quantity}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-gray-800">
                          {formatPrice(item.revenue)}
                        </td>
                      </tr>
                    ))}

                    {dailyReports.length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-12 text-center text-sm text-gray-400"
                        >
                          No sales records available for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>

                  {dailyReports.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          Total
                        </td>

                        <td className="px-6 py-4 font-bold text-gray-800">
                          {filteredOrders.length}
                        </td>

                        <td className="px-6 py-4 font-bold text-gray-800">
                          {totalQuantity}
                        </td>

                        <td className="px-6 py-4 font-bold text-amber-700">
                          {formatPrice(totalRevenue)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </section>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5 text-xs text-gray-400">
              <p>
                Report based on {filteredOrders.length} completed purchase records.
              </p>

              <p>
                Generated by Admin Reports
              </p>
            </div>
          </>
        )}
      </main>

      {/* Print Styling */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }

          aside,
          nav,
          header,
          button,
          input,
          select {
            display: none !important;
          }

          main {
            margin-left: 0 !important;
            padding: 10px !important;
            padding-top: 10px !important;
          }

          section {
            break-inside: avoid;
            box-shadow: none !important;
          }

          table {
            font-size: 10px !important;
          }

          th, td {
            padding: 8px !important;
          }

          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

export default Reports;
