"use client"

import * as React from "react"
import { Pricing } from "@/components/landing/pricing"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function PricingPage() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <Pricing />
      </div>
    </DashboardLayout>
  )
}
