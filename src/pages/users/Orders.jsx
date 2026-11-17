
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DB } from './components/Header'

import {
  Package,
  ShoppingBag,
  ArrowRight,
  CheckCircle,
  IndianRupee,
  CalendarDays,
  Download,
  Star,
  X,
  Send,
  MessageSquare
} from 'lucide-react'

import Header from './components/Header'
import Footer from './components/Footer'

function Orders() {
  const API = `${DB}`

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // INVOICE
  const [printOrder, setPrintOrder] = useState(null)

  // REVIEW POPUP
  const [showReview, setShowReview] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  // EXISTING REVIEWS
  const [existingReviews, setExistingReviews] = useState([])

  const user = JSON.parse(
    localStorage.getItem('user') || 'null'
  )

  const userId = user?.id

  // FETCH ORDERS AND REVIEWS
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError('')

        if (!userId) {
          setOrders([])
          setExistingReviews([])
          return
        }

        const [
          cartResponse,
          productsResponse,
          reviewsResponse
        ] = await Promise.all([
          fetch(`${API}/cart`),
          fetch(`${API}/products`),
          fetch(`${API}/reviews`)
        ])

        if (
          !cartResponse.ok ||
          !productsResponse.ok ||
          !reviewsResponse.ok
        ) {
          throw new Error('Failed to fetch order details.')
        }

        const cartData = await cartResponse.json()
        const productsData = await productsResponse.json()
        const reviewsData = await reviewsResponse.json()

        // GET ONLY LOGGED-IN USER'S PURCHASED ITEMS
        const purchasedItems = cartData.filter(
          item =>
            String(item.userId) === String(userId) &&
            Number(item.status) === 0
        )

        // MATCH PRODUCTS WITH CART ITEMS
        const orderDetails = purchasedItems.map(item => {
          const product = productsData.find(
            product =>
              String(product.id) === String(item.productId)
          )

          return {
            ...item,
            product
          }
        })

        // GROUP PRODUCTS USING ORDER ID
        const groupedOrders = {}

        orderDetails.forEach(item => {
          const groupKey = item.orderId
            ? `order-${item.orderId}`
            : item.purchaseDate
              ? `date-${item.purchaseDate}`
              : `item-${item.id}`

          if (!groupedOrders[groupKey]) {
            groupedOrders[groupKey] = {
              orderId: item.orderId || `OLD-${item.id}`,
              purchaseDate: item.purchaseDate || '',
              items: []
            }
          }

          groupedOrders[groupKey].items.push(item)
        })

        const finalOrders = Object.values(groupedOrders)

        // NEWEST ORDER FIRST
        finalOrders.sort(
          (a, b) =>
            new Date(b.purchaseDate || 0) -
            new Date(a.purchaseDate || 0)
        )

        setOrders(finalOrders)

        // GET LOGGED-IN USER'S REVIEWS
        const userReviews = reviewsData.filter(
          review =>
            String(review.userId) === String(userId)
        )

        setExistingReviews(userReviews)

      } catch (err) {
        setError(
          'Unable to load your orders. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [userId])

  // FORMAT PRICE
  const formatPrice = amount =>
    Number(amount || 0).toLocaleString('en-IN')

  // FORMAT DATE
  const formatDate = date => {
    if (!date) return 'Date unavailable'

    const parsedDate = new Date(date)

    if (isNaN(parsedDate.getTime())) {
      return 'Date unavailable'
    }

    return parsedDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // TOTAL NUMBER OF ORDERS
  const totalOrders = orders.length

  // TOTAL PURCHASED PRODUCTS
  const totalProducts = orders.reduce(
    (total, order) =>
      total + order.items.length,
    0
  )

  // TOTAL PURCHASE VALUE
  const totalAmount = orders.reduce(
    (total, order) =>
      total +
      order.items.reduce(
        (sum, item) =>
          sum +
          Number(item.product?.price || 0) *
          Number(item.quantity || 1),
        0
      ),
    0
  )

  // CALCULATE ORDER TOTAL
  const getOrderTotal = order => {
    return order.items.reduce(
      (total, item) =>
        total +
        Number(item.product?.price || 0) *
        Number(item.quantity || 1),
      0
    )
  }

  // CHECK WHETHER ORDER IS ALREADY REVIEWED
  const isReviewed = order => {
    return existingReviews.some(
      review =>
        String(review.orderId) === String(order.orderId)
    )
  }

  // OPEN REVIEW POPUP
  const openReview = order => {
    setSelectedOrder(order)
    setRating(0)
    setReviewText('')
    setShowReview(true)
  }

  // SUBMIT REVIEW
  const submitReview = async () => {
    if (!rating) {
      alert('Please select a star rating.')
      return
    }

    if (!reviewText.trim()) {
      alert('Please write your review.')
      return
    }

    if (!selectedOrder) return

    if (isReviewed(selectedOrder)) {
      alert('You have already reviewed this order.')
      return
    }

    try {
      setReviewLoading(true)

      const response = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: String(selectedOrder.orderId),
          userId: String(userId),
          rating: rating,
          review: reviewText.trim(),
          createdAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Unable to submit your review.')
      }

      const newReview = await response.json()

      setExistingReviews(previous => [
        ...previous,
        newReview
      ])

      setShowReview(false)
      setSelectedOrder(null)
      setRating(0)
      setReviewText('')

      alert('Your review has been submitted successfully.')

    } catch (err) {
      alert(err.message)
    } finally {
      setReviewLoading(false)
    }
  }

  // DOWNLOAD INVOICE
  const downloadInvoice = order => {
    setPrintOrder(order)
  }

  // PRINT AFTER INVOICE IS RENDERED
  useEffect(() => {
    if (printOrder) {
      const timer = setTimeout(() => {
        window.print()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [printOrder])

  // CLEAR INVOICE AFTER PRINTING
  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintOrder(null)
    }

    window.addEventListener('afterprint', handleAfterPrint)

    return () => {
      window.removeEventListener(
        'afterprint',
        handleAfterPrint
      )
    }
  }, [])

  return (
    <>
      <Header />

      <main className="min-h-screen w-full bg-gray-50">

        {/* PAGE HEADER */}
        <section className="w-full bg-black px-5 py-12 text-white md:px-12">

          <div className="mb-4 flex items-center gap-3">

            <Package
              size={30}
              className="text-amber-400"
            />

            <span className="font-semibold uppercase tracking-widest text-sm text-amber-400">
              ShoeCraft
            </span>

          </div>

          <h1 className="text-3xl font-extrabold md:text-5xl">
            My Orders
          </h1>

          <p className="mt-3 text-gray-400">
            View your previously purchased products.
          </p>

        </section>

        <section className="w-full px-4 py-10 md:px-10 lg:px-12">

          {/* SUMMARY CARDS */}
          <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">

            {/* TOTAL ORDERS */}
            <div className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100">

                <ShoppingBag
                  size={27}
                  className="text-amber-600"
                />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Total Orders
                </p>

                <h2 className="text-2xl font-bold text-gray-900">
                  {totalOrders}
                </h2>

              </div>

            </div>

            {/* PURCHASED PRODUCTS */}
            <div className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">

                <Package
                  size={27}
                  className="text-blue-600"
                />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Purchased Items
                </p>

                <h2 className="text-2xl font-bold text-gray-900">
                  {totalProducts}
                </h2>

              </div>

            </div>

            {/* TOTAL PURCHASE VALUE */}
            <div className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">

                <IndianRupee
                  size={27}
                  className="text-green-600"
                />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Total Purchase Value
                </p>

                <h2 className="text-2xl font-bold text-gray-900">
                  ₹{formatPrice(totalAmount)}
                </h2>

              </div>

            </div>

          </div>

          {/* ORDER HISTORY HEADING */}
          <div className="mb-6 flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold text-gray-900">
                Order History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your purchased products
              </p>

            </div>

            <Link
              to="/collections"
              className="hidden items-center gap-2 text-sm font-semibold text-amber-600 hover:text-black sm:flex"
            >
              Continue Shopping
              <ArrowRight size={17} />
            </Link>

          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-2xl bg-white p-16 text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>

              <p className="text-gray-500">
                Loading your orders...
              </p>

            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">

              <p className="text-red-600">
                {error}
              </p>

            </div>
          )}

          {/* EMPTY ORDERS */}
          {!loading && !error && orders.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center md:py-20">

              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">

                <ShoppingBag
                  size={42}
                  className="text-gray-400"
                />

              </div>

              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                No Orders Yet
              </h2>

              <p className="mb-7 text-gray-500">
                You haven't purchased any products yet.
              </p>

              <Link
                to="/user/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-3 font-semibold text-white transition hover:bg-amber-500 hover:text-black"
              >
                <ShoppingBag size={18} />
                Start Shopping
              </Link>

            </div>
          )}

          {/* ORDER LIST */}
          {!loading && !error && orders.length > 0 && (

            <div className="space-y-6">

              {orders.map(order => {

                const orderTotal = getOrderTotal(order)

                const purchaseDate = formatDate(
                  order.purchaseDate
                )

                return (

                  <div
                    key={order.orderId}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md"
                  >

                    {/* ORDER TOP */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 md:px-7">

                      <div>

                        <p className="text-xs uppercase tracking-wider text-gray-400">
                          Order Reference
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          #{order.orderId}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {order.items.length} Product(s)
                        </p>

                      </div>

                      <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">

                        <CheckCircle size={16} />

                        Purchased

                      </div>

                    </div>

                    {/* PRODUCTS IN THIS ORDER */}
                    <div className="divide-y divide-gray-100">

                      {order.items.map(item => {

                        const product = item.product

                        const price = Number(
                          product?.price || 0
                        )

                        const quantity = Number(
                          item.quantity || 1
                        )

                        const itemTotal = price * quantity

                        return (

                          <div
                            key={item.id}
                            className="flex flex-col gap-6 p-5 md:flex-row md:p-7"
                          >

                            {/* PRODUCT IMAGE */}
                            <div className="h-44 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 md:h-40 md:w-40">

                              {product?.image || product?.imageUrl ? (

                                <img
                                  src={
                                    product.image ||
                                    product.imageUrl
                                  }
                                  alt={
                                    product.name || 'Product'
                                  }
                                  className="h-full w-full object-cover"
                                />

                              ) : (

                                <div className="flex h-full items-center justify-center">

                                  <Package
                                    size={45}
                                    className="text-gray-300"
                                  />

                                </div>

                              )}

                            </div>

                            {/* PRODUCT INFORMATION */}
                            <div className="flex flex-1 flex-col justify-center">

                              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                                {product?.category || 'ShoeCraft Product'}
                              </p>

                              <h3 className="mt-2 text-xl font-bold text-gray-900">
                                {product?.name ||
                                  product?.productName ||
                                  'Product details unavailable'}
                              </h3>

                              <p className="mt-2 text-sm text-gray-500">
                                Product ID: {item.productId}
                              </p>

                              <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">

                                <div>

                                  <p className="text-xs uppercase text-gray-400">
                                    Price
                                  </p>

                                  <p className="mt-1 font-semibold text-gray-800">
                                    ₹{formatPrice(price)}
                                  </p>

                                </div>

                                <div>

                                  <p className="text-xs uppercase text-gray-400">
                                    Quantity
                                  </p>

                                  <p className="mt-1 font-semibold text-gray-800">
                                    {quantity}
                                  </p>

                                </div>

                                <div>

                                  <p className="text-xs uppercase text-gray-400">
                                    Total
                                  </p>

                                  <p className="mt-1 font-bold text-green-600">
                                    ₹{formatPrice(itemTotal)}
                                  </p>

                                </div>

                                <div>

                                  <p className="text-xs uppercase text-gray-400">
                                    Payment
                                  </p>

                                  <p className="mt-1 font-semibold text-green-600">
                                    Completed
                                  </p>

                                </div>

                              </div>

                            </div>

                          </div>

                        )
                      })}

                    </div>

                    {/* ORDER FOOTER */}
                    <div className="flex flex-col gap-5 border-t border-gray-100 bg-gray-50 px-5 py-5 md:px-7">

                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <CalendarDays
                            size={18}
                            className="text-amber-600"
                          />

                          <span className="font-medium">
                            Purchased on:
                          </span>

                          <span>
                            {purchaseDate}
                          </span>

                        </div>

                        <p className="text-lg font-bold text-gray-900">
                          Order Total: ₹{formatPrice(orderTotal)}
                        </p>

                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

                        {/* DOWNLOAD INVOICE */}
                        <button
                          type="button"
                          onClick={() => downloadInvoice(order)}
                          className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                        >
                          <Download size={18} />
                          Download Invoice
                        </button>

                        {/* RATE AND REVIEW */}
                        <button
                          type="button"
                          onClick={() => openReview(order)}
                          disabled={isReviewed(order)}
                          className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                        >

                          {isReviewed(order) ? (
                            <CheckCircle size={18} />
                          ) : (
                            <Star size={18} />
                          )}

                          {isReviewed(order)
                            ? 'Reviewed'
                            : 'Rate & Review'}

                        </button>

                      </div>

                    </div>

                  </div>

                )
              })}

            </div>

          )}

          {/* MOBILE SHOPPING LINK */}
          <div className="mt-8 sm:hidden">

            <Link
              to="/user/shop"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 font-semibold text-white"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>

          </div>

        </section>

      </main>

      {/* REVIEW POPUP */}
      {showReview && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowReview(false)
            }
          }}
        >

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            {/* POPUP HEADER */}
            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Rate Your Order
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Share your shopping experience.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={21} />
              </button>

            </div>

            {/* ORDER REFERENCE */}
            <div className="mb-5 rounded-lg bg-gray-50 p-3">

              <p className="text-xs text-gray-500">
                Order Reference
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                #{selectedOrder?.orderId}
              </p>

            </div>

            {/* FIVE STAR RATING */}
            <div className="mb-6">

              <p className="mb-3 text-sm font-semibold text-gray-700">
                Your Rating
              </p>

              <div className="flex gap-2">

                {[1, 2, 3, 4, 5].map(star => (

                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition hover:scale-110"
                  >

                    <Star
                      size={34}
                      className={
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }
                    />

                  </button>

                ))}

              </div>

              <p className="mt-2 text-sm text-gray-500">

                {rating === 0
                  ? 'Select your rating'
                  : `${rating} out of 5 stars`}

              </p>

            </div>

            {/* REVIEW TEXT */}
            <div className="mb-5">

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Write Your Review
              </label>

              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                maxLength={1000}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {reviewText.length}/1000
              </p>

            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="button"
              onClick={submitReview}
              disabled={reviewLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 font-semibold text-white transition hover:bg-amber-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Send size={17} />

              {reviewLoading
                ? 'Submitting...'
                : 'Submit Review'}

            </button>

          </div>

        </div>

      )}

      {/* PRINT INVOICE */}
      {printOrder && (

        <div
          id="invoice-print"
          className="hidden bg-white p-8 text-gray-900"
        >

          {/* INVOICE HEADER */}
          <div className="flex items-start justify-between border-b-2 border-black pb-6">

            <div>

              <h1 className="text-3xl font-extrabold tracking-wider">
                SHOECRAFT
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Your Style, Your Steps.
              </p>

            </div>

            <div className="text-right">

              <h2 className="text-2xl font-bold">
                INVOICE
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Order #{printOrder.orderId}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {formatDate(printOrder.purchaseDate)}
              </p>

            </div>

          </div>

          {/* CUSTOMER DETAILS */}
          <div className="mt-8 flex justify-between gap-8">

            <div>

              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                Bill To
              </p>

              <h3 className="font-bold">
                {user?.name || 'Customer'}
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                {user?.email || ''}
              </p>

            </div>

            <div className="text-right">

              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                Payment Status
              </p>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                PAID
              </span>

            </div>

          </div>

          {/* PRODUCT TABLE */}
          <div className="mt-10">

            <table className="w-full border-collapse text-left">

              <thead>

                <tr className="border-y-2 border-gray-300 bg-gray-50">

                  <th className="px-3 py-4 text-xs font-bold uppercase">
                    Product
                  </th>

                  <th className="px-3 py-4 text-xs font-bold uppercase">
                    Product ID
                  </th>

                  <th className="px-3 py-4 text-center text-xs font-bold uppercase">
                    Qty
                  </th>

                  <th className="px-3 py-4 text-right text-xs font-bold uppercase">
                    Price
                  </th>

                  <th className="px-3 py-4 text-right text-xs font-bold uppercase">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {printOrder.items.map(item => {

                  const product = item.product

                  const price = Number(product?.price || 0)
                  const quantity = Number(item.quantity || 1)
                  const itemTotal = price * quantity

                  return (

                    <tr
                      key={item.id}
                      className="border-b border-gray-200"
                    >

                      <td className="px-3 py-4">

                        <div className="flex items-center gap-3">

                          {product?.image || product?.imageUrl ? (

                            <img
                              src={
                                product.image ||
                                product.imageUrl
                              }
                              alt={product?.name || 'Product'}
                              className="h-14 w-14 rounded-lg object-cover"
                            />

                          ) : (

                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100">
                              <Package size={22} />
                            </div>

                          )}

                          <div>

                            <p className="font-semibold">
                              {product?.name ||
                                product?.productName ||
                                'Product'}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {product?.category || 'ShoeCraft Product'}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-3 py-4 text-sm">
                        {item.productId}
                      </td>

                      <td className="px-3 py-4 text-center text-sm">
                        {quantity}
                      </td>

                      <td className="px-3 py-4 text-right text-sm">
                        ₹{formatPrice(price)}
                      </td>

                      <td className="px-3 py-4 text-right text-sm font-semibold">
                        ₹{formatPrice(itemTotal)}
                      </td>

                    </tr>

                  )

                })}

              </tbody>

            </table>

          </div>

          {/* INVOICE TOTAL */}
          <div className="mt-8 flex justify-end">

            <div className="w-full max-w-xs space-y-4">

              <div className="flex justify-between text-sm text-gray-600">

                <span>
                  Subtotal
                </span>

                <span>
                  ₹{formatPrice(getOrderTotal(printOrder))}
                </span>

              </div>

              <div className="flex justify-between text-sm text-gray-600">

                <span>
                  Delivery
                </span>

                <span className="font-semibold text-green-600">
                  FREE
                </span>

              </div>

              <div className="flex justify-between border-t-2 border-black pt-4 text-lg font-extrabold">

                <span>
                  Grand Total
                </span>

                <span>
                  ₹{formatPrice(getOrderTotal(printOrder))}
                </span>

              </div>

            </div>

          </div>

          {/* INVOICE FOOTER */}
          <div className="mt-16 border-t border-gray-200 pt-6 text-center">

            <h3 className="font-bold">
              Thank You for Shopping with ShoeCraft!
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              We appreciate your purchase. Visit us again.
            </p>

            <p className="mt-5 text-xs text-gray-400">
              This is a computer-generated invoice.
            </p>

          </div>

        </div>

      )}

      <Footer />

      {/* PRINT STYLES */}
      <style>{`
        @media print {

          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          #invoice-print,
          #invoice-print * {
            visibility: visible !important;
          }

          #invoice-print {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          #invoice-print table {
            page-break-inside: auto;
          }

          #invoice-print tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          #invoice-print img {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

        }
      `}</style>

    </>
  )
}

export default Orders
