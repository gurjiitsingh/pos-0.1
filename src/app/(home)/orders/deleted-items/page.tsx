import { Suspense } from "react";
import OrderDetailContent from "./OrderDetailContent";

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-sm opacity-50">
            Loading order...
          </div>
        </div>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}