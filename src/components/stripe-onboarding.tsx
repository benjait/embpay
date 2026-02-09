"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, CreditCard, Shield } from "lucide-react";

// Stripe referral link - EmbPay gets commission when merchants sign up
const STRIPE_REFERRAL_URL = "https://stripe.com";

export function StripeOnboarding() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateStripe = () => {
    setIsLoading(true);
    // Open Stripe in new tab with referral tracking
    window.open(STRIPE_REFERRAL_URL, "_blank");
    setIsLoading(false);
  };

  return (
    <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
          <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <CardTitle className="text-xl">Don&apos;t have Stripe yet?</CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Create a free Stripe account to accept payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Accept credit cards worldwide</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Payouts to your bank account</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>2.9% + 30¢ per transaction</span>
          </div>
        </div>

        <Button 
          onClick={handleCreateStripe}
          disabled={isLoading}
          className="w-full bg-[#635BFF] hover:bg-[#4f49cc] text-white"
        >
          {isLoading ? "Opening Stripe..." : "Create Free Stripe Account"}
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          You&apos;ll be redirected to stripe.com to create your account
        </p>
      </CardContent>
    </Card>
  );
}
