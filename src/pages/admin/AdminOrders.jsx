
import React, { useEffect, useMemo, useState } from "react";
import { DB } from './components/Header'
import {
  Search,
  ShoppingBag,
  Package,
  IndianRupee,
  CalendarDays,
  Clock,
  RefreshCw,
  Filter,
  Eye,
  X,
  User,
  Mail,
  Boxes,
  Star,
} from "lucide-react";

import Header from "./components/Header";

function AdminOrders() {


  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch orders, users, products and reviews
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [orderRes, userRes, productRes, reviewRes] = await Promise.all([
        fetch(`${DB}/cart?status=0`),
        fetch(`${DB}/users`),
        fetch(`${DB}/products`),
        fetch(`${DB}/reviews`),
      ]);

      if (
        !orderRes.ok ||
        !userRes.ok ||
        !productRes.ok ||
        !reviewRes.ok
      ) {
        throw new Error("Unable to fetch order details.");
      }

      const orderData = await orderRes.json();
      const userData = await userRes.json();
      const productData = await productRes.json();
      const reviewData = await reviewRes.json();

      setOrders(
        orderData
          .filter((item) => Number(item.status) === 0)
          .sort(
            (a, b) =>
              new Date(b.purchaseDate).getTime() -
              new Date(a.purchaseDate).getTime()
          )
      );

      setUsers(userData);
      setProducts(productData);
      setReviews(reviewData);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Find customer
  const getUser = (userId) => {
    return users.find(
      (user) => String(user.id) === String(userId)
    );
  };

  // Find product
  const getProduct = (productId) => {
    return products.find(
      (product) => String(product.id) === String(productId)
    );
  };

  // Find review using order ID
  const getReview = (order) => {
    if (!order) return null;

    return (
      reviews.find((review) => {
        return (
          String(review.orderId) === String(order.orderId) ||
          String(review.orderId) === String(order.id)
        );
      }) || null
    );
  };

  // Format purchase date
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

  // Format purchase time
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      const match = dateString.match(/\d{1,2}:\d{2}\s*(am|pm)/i);
      return match ? match[0] : "N/A";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get date key for filtering
  const getDateKey = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    const parts = dateString.split(",");

    if (parts.length > 0) {
      const parsed = new Date(parts[0].trim());

      if (!Number.isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        const day = String(parsed.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
      }
    }

    return "";
  };

  // Calculate item total
  const getOrderTotal = (order) => {
    const product = getProduct(order.productId);

    return Number(product?.price || 0) * Number(order.quantity || 0);
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const user = users.find(
        (item) => String(item.id) === String(order.userId)
      );

      const product = products.find(
        (item) => String(item.id) === String(order.productId)
      );

      const searchText = search.toLowerCase().trim();

      const searchMatch =
        !searchText ||
        String(order.id || "").toLowerCase().includes(searchText) ||
        String(order.userId || "").toLowerCase().includes(searchText) ||
        String(order.productId || "").toLowerCase().includes(searchText) ||
        String(user?.name || "").toLowerCase().includes(searchText) ||
        String(user?.email || "").toLowerCase().includes(searchText) ||
        String(product?.name || "").toLowerCase().includes(searchText) ||
        String(product?.productCode || "").toLowerCase().includes(searchText);

      const orderDate = getDateKey(order.purchaseDate);

      const fromMatch = !fromDate || orderDate >= fromDate;
      const toMatch = !toDate || orderDate <= toDate;

      return searchMatch && fromMatch && toMatch;
    });
  }, [orders, users, products, search, fromDate, toDate]);

  // Summary values
  const totalOrders = filteredOrders.length;

  const totalItems = filteredOrders.reduce(
    (total, order) => total + Number(order.quantity || 0),
    0
  );

  const totalSales = filteredOrders.reduce(
    (total, order) => total + getOrderTotal(order),
    0
  );

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="ml-64 w-[calc(100%-16rem)] px-8 pb-10 pt-3">

        {/* Heading */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600">
              <ShoppingBag size={17} />
              ORDER MANAGEMENT
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Orders
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage and track all customer purchases.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* Total Orders */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {totalOrders}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-50 p-4 text-blue-600">
                <ShoppingBag size={24} />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Orders matching your filters
            </p>
          </div>

          {/* Total Items */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Items
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {totalItems.toLocaleString("en-IN")}
                </h2>
              </div>

              <div className="rounded-xl bg-green-50 p-4 text-green-600">
                <Boxes size={24} />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Total purchased quantities
            </p>
          </div>

          {/* Total Sales */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Sales
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {formatPrice(totalSales)}
                </h2>
              </div>

              <div className="rounded-xl bg-amber-50 p-4 text-amber-600">
                <IndianRupee size={24} />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Calculated from product prices
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-2">
            <Filter size={18} className="text-amber-600" />

            <h2 className="font-bold text-gray-800">
              Filter Orders
            </h2>
          </div>

          <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-4">

            {/* Search */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-600">
                Search
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 focus-within:border-amber-500">
                <Search size={18} className="text-gray-400" />

                <input
                  type="text"
                  placeholder="Search order ID, customer or product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {/* From Date */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">
                To Date
              </label>

              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Showing purchased orders (Status: 0)
            </p>

            <button
              onClick={() => {
                setSearch("");
                setFromDate("");
                setToDate("");
              }}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Orders Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="font-bold text-gray-900">
                Customer Orders
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Complete details of purchased products
              </p>
            </div>

            <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
              {filteredOrders.length} Orders
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw
                size={30}
                className="animate-spin text-amber-500"
              />

              <p className="mt-3 text-sm text-gray-500">
                Loading orders...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="rounded-full bg-gray-100 p-5">
                <Package size={30} className="text-gray-400" />
              </div>

              <h3 className="mt-4 font-bold text-gray-700">
                No Orders Found
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                Try changing your search or date filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">

                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">
                      Order ID
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Customer
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Product
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Quantity
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Total
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Purchase Date
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const user = getUser(order.userId);
                    const product = getProduct(order.productId);
                    const review = getReview(order);

                    return (
                      <tr
                        key={order.id}
                        className="transition hover:bg-gray-50"
                      >

                        {/* Order ID */}
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-gray-700">
                            #{order.id}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {user?.name || "Unknown Customer"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {user?.email || "Email unavailable"}
                            </p>
                          </div>
                        </td>

                        {/* Product */}
                        <td className="px-6 py-5">
                          {product ? (
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-12 w-12 rounded-xl border border-gray-100 bg-gray-50 object-cover"
                              />

                              <div>
                                <p className="font-semibold text-gray-800">
                                  {product.name}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {product.productCode || "N/A"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Product not found
                            </span>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                            <Package size={15} />
                            {order.quantity}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-gray-800">
                            {formatPrice(getOrderTotal(order))}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={15}
                                className="text-gray-400"
                              />
                              {formatDate(order.purchaseDate)}
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                              <Clock size={13} />
                              {formatTime(order.purchaseDate)}
                            </div>
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">

                            {/* View Order */}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                            >
                              <Eye size={16} />
                              View
                            </button>

                            {/* Customer Rating */}
                            {review ? (
                              <button
                                onClick={() =>
                                  setSelectedReviewOrder(order)
                                }
                                title={`View ${review.rating}/5 rating and review`}
                                aria-label={`View customer rating: ${review.rating} out of 5`}
                                className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-2.5 text-sm font-bold text-amber-600 transition hover:bg-amber-100"
                              >
                                <Star
                                  size={18}
                                  className="fill-amber-400 text-amber-400"
                                />
                                {review.rating}/5
                              </button>
                            ) : (
                              <span className="rounded-lg bg-gray-100 px-3 py-2.5 text-xs font-medium text-gray-400">
                                Not Rated
                              </span>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredOrders.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-400">
                Showing {filteredOrders.length} of {orders.length} purchased orders
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Order Details Popup */}
      {selectedOrder && (() => {
        const user = getUser(selectedOrder.userId);
        const product = getProduct(selectedOrder.productId);

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Popup Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Order Details
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Order ID: #{selectedOrder.id}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 p-6">

                {/* Customer Details */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
                    <User size={18} className="text-amber-600" />
                    Customer Information
                  </h3>

                  <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Customer Name
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {user?.name || "Unknown Customer"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Email Address
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Mail size={14} />
                        {user?.email || "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Customer ID
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {selectedOrder.userId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
                    <Package size={18} className="text-amber-600" />
                    Product Information
                  </h3>

                  <div className="rounded-xl border border-gray-100 p-4">
                    {product ? (
                      <div className="flex gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-24 w-24 rounded-xl border border-gray-100 bg-gray-50 object-cover"
                        />

                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">
                            {product.name}
                          </h4>

                          <p className="mt-1 text-xs text-gray-400">
                            Product Code: {product.productCode || "N/A"}
                          </p>

                          <p className="mt-2 text-sm font-semibold text-amber-600">
                            {formatPrice(product.price)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Quantity: {selectedOrder.quantity}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        Product information unavailable.
                      </p>
                    )}
                  </div>
                </div>

                {/* Purchase Details */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
                    <ShoppingBag size={18} className="text-amber-600" />
                    Purchase Information
                  </h3>

                  <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Order ID
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        #{selectedOrder.id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Purchase Date
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {formatDate(selectedOrder.purchaseDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Purchase Time
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {formatTime(selectedOrder.purchaseDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Quantity
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {selectedOrder.quantity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                      <span className="font-bold text-gray-800">
                        Total Amount
                      </span>

                      <span className="text-xl font-bold text-amber-600">
                        {formatPrice(getOrderTotal(selectedOrder))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50 p-4">
                  <div>
                    <p className="text-sm font-bold text-green-800">
                      Purchased
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                      Order status: 0
                    </p>
                  </div>

                  <span className="rounded-lg bg-green-100 px-3 py-2 text-xs font-bold text-green-700">
                    Completed
                  </span>
                </div>

              </div>

              {/* Popup Footer */}
              <div className="border-t border-gray-100 px-6 py-4">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Customer Review Popup */}
      {selectedReviewOrder && (() => {
        const review = getReview(selectedReviewOrder);
        const reviewUser = getUser(selectedReviewOrder.userId);
        const reviewOrderId =
          selectedReviewOrder.orderId || selectedReviewOrder.id;

        return (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
            onClick={() => setSelectedReviewOrder(null)}
          >
            <div
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Review Popup Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Customer Review
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Order ID: #{reviewOrderId}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedReviewOrder(null)}
                  className="rounded-lg bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 p-6">

                {/* Customer */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Customer
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {reviewUser?.name || "Unknown Customer"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {reviewUser?.email || "Email unavailable"}
                  </p>
                </div>

                {review ? (
                  <>
                    {/* Star Rating */}
                    <div>
                      <p className="mb-2 text-sm font-semibold text-gray-600">
                        Rating
                      </p>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={28}
                            className={
                              star <= Number(review.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-100 text-gray-300"
                            }
                          />
                        ))}

                        <span className="ml-2 text-sm font-bold text-gray-700">
                          {Number(review.rating) || 0}/5
                        </span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <p className="mb-2 text-sm font-semibold text-gray-600">
                        Customer Feedback
                      </p>

                      <div className="min-h-28 rounded-xl border border-gray-100 bg-white p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                          {review.review || "No written review provided."}
                        </p>
                      </div>
                    </div>

                    {/* Review Date */}
                    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                      <span className="text-sm text-gray-500">
                        Review Date
                      </span>

                      <span className="text-sm font-semibold text-gray-700">
                        {review.createdAt
                          ? `${formatDate(review.createdAt)} • ${formatTime(review.createdAt)}`
                          : "N/A"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 px-5 py-10 text-center">
                    <div className="rounded-full bg-amber-50 p-4 text-amber-500">
                      <Star size={28} />
                    </div>

                    <h3 className="mt-4 font-bold text-gray-800">
                      No Review Found
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      This customer has not submitted a review for this order.
                    </p>
                  </div>
                )}
              </div>

              {/* Review Popup Footer */}
              <div className="border-t border-gray-100 px-6 py-4">
                <button
                  onClick={() => setSelectedReviewOrder(null)}
                  className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default AdminOrders;
