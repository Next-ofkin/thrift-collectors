"use client";
import { useState } from "react";
import { recordDeposit } from "../actions";

export default function DepositForm({ accountId }: { accountId: string }) {
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      action={async (fd) => {
        setMsg(null);
        fd.set("account_id", accountId);
        const res = await recordDeposit(fd);
        if (res.error) setMsg(res.error);
        else setMsg(`Deposit recorded. Ref: ${res.reference_code}`);
      }}
      className="flex items-center gap-2"
    >
      <input className="input input-bordered w-32" name="amount" type="number" step="0.01" min="0" placeholder="Amount" />
      <input className="input input-bordered flex-1" name="description" placeholder="Note (optional)" />
      <button className="btn">Deposit</button>
      {msg && <span className="text-xs opacity-80">{msg}</span>}
    </form>
  );
}
