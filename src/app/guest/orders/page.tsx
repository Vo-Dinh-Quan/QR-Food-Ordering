import OrdersCart from '@/app/guest/orders/orders-cart'
import React from 'react'

export default function OrderPage() {
  return (
    <div className="max-w-[400px] mx-auto space-y-4">
      <h1 className="text-center text-xl font-bold">🍕 Các món đã đặt</h1>
      <OrdersCart />
    </div>
  )
}
