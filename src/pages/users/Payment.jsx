
import React, { useEffect, useState } from 'react'
import { DB } from './components/Header'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  ShieldCheck,
  CreditCard,
  ArrowLeft,
  ShoppingBag,
  Download
} from 'lucide-react'

import Header from './components/Header'
import Footer from './components/Footer'

function Payment() {
  const navigate = useNavigate()
  const API = `${DB}`

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const [checkoutItems, setCheckoutItems] = useState([])
  const [completedItems, setCompletedItems] = useState([])
  const [loading, setLoading] = useState(false)

  const [paymentDone, setPaymentDone] = useState(
    sessionStorage.getItem('paymentSuccess') === 'true'
  )

  const [orderId, setOrderId] = useState(
    sessionStorage.getItem('shoeCraftOrderId') || ''
  )

  const [purchaseDate, setPurchaseDate] = useState(
    sessionStorage.getItem('purchaseDate') || ''
  )

  // Get checkout products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (paymentDone) {
          const completed = JSON.parse(
            sessionStorage.getItem('completedCheckoutItems') || '[]'
          )

          setCompletedItems(completed)
          return
        }

        if (!user?.id) {
          navigate('/login')
          return
        }

        let cart = JSON.parse(
          sessionStorage.getItem('checkoutCart') || '[]'
        )

        if (!Array.isArray(cart) || cart.length === 0) {
          const response = await fetch(`${API}/cart`)

          if (!response.ok) {
            throw new Error('Unable to load cart')
          }

          const allCartItems = await response.json()

          cart = allCartItems.filter(
            item =>
              String(item.userId) === String(user.id) &&
              Number(item.status) === 1
          )
        } else {
          cart = cart.filter(item => Number(item.status) === 1)
        }

        const productResponse = await fetch(`${API}/products`)

        if (!productResponse.ok) {
          throw new Error('Unable to load products')
        }

        const products = await productResponse.json()

        const finalItems = cart.map(item => {
          const product = products.find(
            product =>
              String(product.id) === String(
                item.productId || item.id
              )
          )

          return {
            ...product,
            ...item,
            product: product || item,
            quantity: Number(item.quantity) || 1
          }
        })

        setCheckoutItems(finalItems)

        sessionStorage.setItem(
          'checkoutCart',
          JSON.stringify(finalItems)
        )

        sessionStorage.setItem(
          'checkoutUserId',
          String(user.id)
        )

      } catch (error) {
        console.error('Checkout error:', error)
      }
    }

    loadProducts()
  }, [paymentDone])

  // Calculate total
  const totalAmount = (items) => {
    return items.reduce((total, item) => {
      const product = item.product || item

      return total +
        (Number(product.price) || 0) *
        (Number(item.quantity) || 1)
    }, 0)
  }

  // Complete payment
  const handlePayment = async () => {
    if (!user?.id) {
      navigate('/login')
      return
    }

    if (checkoutItems.length === 0) {
      alert('No products available for payment')
      return
    }

    try {
      setLoading(true)

      const date = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })

      const generatedOrderId =
        'SC' + Date.now().toString().slice(-10)

      const updatedItems = []

      // Update cart status
      for (const item of checkoutItems) {
        const cartId = item.cartId || item.id

        const response = await fetch(
          `${API}/cart/${cartId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 0,
              purchaseDate: date,
              orderId: generatedOrderId
            })
          }
        )

        if (!response.ok) {
          throw new Error('Unable to update cart')
        }

        updatedItems.push({
          ...item,
          cartId,
          status: 0,
          purchaseDate: date
        })
      }

      // Save completed order
      sessionStorage.setItem('paymentSuccess', 'true')

      sessionStorage.setItem(
        'completedCheckoutItems',
        JSON.stringify(updatedItems)
      )

      sessionStorage.setItem('purchaseDate', date)

      sessionStorage.setItem(
        'shoeCraftOrderId',
        generatedOrderId
      )

      setCompletedItems(updatedItems)
      setOrderId(generatedOrderId)
      setPurchaseDate(date)
      setPaymentDone(true)

    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment could not be completed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Download invoice PDF
  const downloadBill = () => {
    window.print()
  }

  // Continue shopping
  const backToCollection = () => {
    sessionStorage.removeItem('paymentSuccess')
    sessionStorage.removeItem('completedCheckoutItems')
    sessionStorage.removeItem('checkoutCart')
    sessionStorage.removeItem('purchaseDate')
    sessionStorage.removeItem('shoeCraftOrderId')
    sessionStorage.removeItem('checkoutUserId')

    navigate('/collections')
  }

  const invoiceTotal = totalAmount(completedItems)
  const paymentTotal = totalAmount(checkoutItems)

  return (
    <>
      <Header />

      <div className="min-h-screen w-full bg-gray-50 px-6 py-10 sm:px-10 lg:px-14">

        {!paymentDone ? (

          // PAYMENT SECTION
          <div className="w-full">

            <button
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="grid w-full gap-8 md:grid-cols-5">

              {/* LEFT SECTION */}
              <div className="space-y-6 md:col-span-3">

                <div className="rounded-2xl bg-white p-6 shadow-sm">

                  <div className="mb-6 flex items-center gap-3">

                    <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                      <CreditCard size={23} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Payment Details
                      </h2>

                      <p className="text-sm text-gray-500">
                        Review your order before confirming
                      </p>
                    </div>

                  </div>

                  <div className="space-y-4 border-t pt-5">

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Customer
                      </span>

                      <span className="font-semibold text-gray-800">
                        {user?.name || 'Customer'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Email
                      </span>

                      <span className="font-semibold text-gray-800">
                        {user?.email || '-'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                      <ShieldCheck size={20} />
                      Secure checkout
                    </div>

                  </div>

                </div>

                {/* PRODUCTS */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">

                  <h2 className="mb-5 text-lg font-bold text-gray-900">
                    Your Products
                  </h2>

                  <div className="space-y-5">

                    {checkoutItems.map((item, index) => {
                      const product = item.product || item

                      return (
                        <div
                          key={item.cartId || item.id || index}
                          className="flex items-center gap-4"
                        >

                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-20 w-20 rounded-xl bg-gray-100 object-contain p-2"
                          />

                          <div className="min-w-0 flex-1">

                            <h3 className="font-semibold text-gray-900">
                              {product.name}
                            </h3>

                            <p className="text-xs text-gray-500">
                              {product.category || 'Shoes'}
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                              Qty: {item.quantity}
                            </p>

                          </div>

                          <p className="font-bold text-gray-900">
                            ₹{(
                              Number(product.price) *
                              Number(item.quantity)
                            ).toLocaleString('en-IN')}
                          </p>

                        </div>
                      )
                    })}

                    {checkoutItems.length === 0 && (
                      <p className="py-6 text-center text-gray-500">
                        No products available.
                      </p>
                    )}

                  </div>

                </div>

              </div>

              {/* RIGHT SECTION */}
              <div className="h-fit rounded-2xl bg-white p-6 shadow-sm md:col-span-2">

                <h2 className="mb-6 text-xl font-bold text-gray-900">
                  Order Summary
                </h2>

                <div className="space-y-4 border-b pb-5 text-sm">

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Total Products
                    </span>

                    <span className="font-semibold">
                      {checkoutItems.reduce(
                        (sum, item) =>
                          sum + Number(item.quantity || 1),
                        0
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-semibold">
                      ₹{paymentTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Delivery
                    </span>

                    <span className="font-semibold text-green-600">
                      FREE
                    </span>
                  </div>

                </div>

                <div className="flex justify-between py-5">

                  <span className="font-bold text-gray-900">
                    Total Amount
                  </span>

                  <span className="text-xl font-bold text-amber-600">
                    ₹{paymentTotal.toLocaleString('en-IN')}
                  </span>

                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading || checkoutItems.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      <ShieldCheck size={19} />
                      Confirm Payment
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs text-gray-400">
                  This is a demo payment confirmation.
                </p>

              </div>

            </div>

          </div>

        ) : (

          // PAYMENT SUCCESS + INVOICE
          <div className="w-full">

            <div className="mb-8 text-center">

              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle size={48} />
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900">
                Payment Successful!
              </h1>

              <p className="mt-2 text-gray-500">
                Thank you for shopping with ShoeCraft.
                Your order has been confirmed.
              </p>

            </div>

            {/* INVOICE */}
            <div
              id="invoice"
              className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10"
            >

              {/* INVOICE HEADER */}
              <div className="flex flex-col justify-between gap-5 border-b pb-7 sm:flex-row">

                <div>
                  <h2 className="text-3xl font-black tracking-wide text-gray-900">
                    SHOE<span className="text-amber-500">CRAFT</span>
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Step Into Your Style
                  </p>
                </div>

                <div className="sm:text-right">

                  <h3 className="text-2xl font-bold text-gray-900">
                    INVOICE
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Order #{orderId}
                  </p>

                  <p className="text-sm text-gray-500">
                    {purchaseDate}
                  </p>

                </div>

              </div>

              {/* CUSTOMER DETAILS */}
              <div className="grid gap-6 border-b py-7 sm:grid-cols-2">

                <div>

                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Billed To
                  </p>

                  <h4 className="font-bold text-gray-900">
                    {user?.name || 'Customer'}
                  </h4>

                  <p className="mt-1 text-sm text-gray-500">
                    {user?.email || '-'}
                  </p>

                </div>

                <div className="sm:text-right">

                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Payment Information
                  </p>

                  <p className="text-sm text-gray-700">
                    Payment Status:{' '}
                    <span className="font-bold text-green-600">
                      PAID
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    Order Status:{' '}
                    <span className="font-bold text-green-600">
                      CONFIRMED
                    </span>
                  </p>

                </div>

              </div>

              {/* PURCHASED PRODUCTS */}
              <div className="py-7">

                <h3 className="mb-5 text-lg font-bold text-gray-900">
                  Purchased Products
                </h3>

                <div className="space-y-5">

                  {completedItems.map((item, index) => {
                    const product = item.product || item
                    const quantity = Number(item.quantity) || 1
                    const price = Number(product.price) || 0

                    return (
                      <div
                        key={item.cartId || item.id || index}
                        className="flex flex-wrap items-center gap-4 border-b border-dashed pb-5"
                      >

                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-20 w-20 rounded-xl bg-gray-100 object-contain p-2"
                        />

                        <div className="min-w-0 flex-1">

                          <h4 className="font-bold text-gray-900">
                            {product.name}
                          </h4>

                          <p className="mt-1 text-xs text-gray-500">
                            Product ID: {product.productId || product.id || item.productId || '-'}
                          </p>

                          <p className="text-xs text-gray-500">
                            Category: {product.category || 'Shoes'}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            ₹{price.toLocaleString('en-IN')} × {quantity}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-xs text-gray-400">
                            Subtotal
                          </p>

                          <p className="font-bold text-gray-900">
                            ₹{(price * quantity).toLocaleString('en-IN')}
                          </p>

                        </div>

                      </div>
                    )
                  })}

                </div>

              </div>

              {/* TOTAL */}
              <div className="ml-auto w-full max-w-none space-y-3 border-t pt-6">

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    ₹{invoiceTotal.toLocaleString('en-IN')}
                  </span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Delivery Charge
                  </span>

                  <span className="font-semibold text-green-600">
                    FREE
                  </span>

                </div>

                <div className="flex justify-between border-t pt-4">

                  <span className="text-lg font-bold text-gray-900">
                    Grand Total
                  </span>

                  <span className="text-2xl font-extrabold text-amber-600">
                    ₹{invoiceTotal.toLocaleString('en-IN')}
                  </span>

                </div>

              </div>

              {/* INVOICE FOOTER */}
              <div className="mt-10 border-t pt-6 text-center">

                <p className="font-bold text-gray-900">
                  Thank you for choosing ShoeCraft!
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  This is a computer-generated invoice.
                  No signature is required.
                </p>

                <p className="mt-2 text-xs font-semibold text-gray-400">
                  SHOECRAFT • STEP INTO YOUR STYLE
                </p>

              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row">

              <button
                onClick={downloadBill}
                className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-7 py-4 font-bold text-white transition hover:bg-gray-800"
              >
                <Download size={19} />
                Download Bill PDF
              </button>

              <button
                onClick={backToCollection}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 py-4 font-bold text-white transition hover:bg-amber-600"
              >
                <ShoppingBag size={19} />
                Continue Shopping
              </button>

            </div>

          </div>

        )}

      </div>

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
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          #invoice,
          #invoice * {
            visibility: visible;
          }

          #invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }

          button,
          header,
          footer {
            display: none !important;
          }

        }
      `}</style>

    </>
  )
}

export default Payment
