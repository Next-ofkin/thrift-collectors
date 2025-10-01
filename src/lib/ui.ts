// src/lib/ui.ts
export function statusBadgeClass(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "pending":
      return "badge badge-warning";
    case "completed":
      return "badge badge-success";
    case "failed":
      return "badge badge-error";
    default:
      return "badge";
  }
}

export function typeColorClass(type?: string) {
  switch ((type ?? "").toLowerCase()) {
    case "deposit":
    case "interest":
      return "text-green-600";
    case "withdrawal":
    case "fee":
    case "payout":
      return "text-red-600";
    case "loan":
      return "text-orange-600";
    case "repayment":
      return "text-blue-600";
    default:
      return "text-current";
  }
}
